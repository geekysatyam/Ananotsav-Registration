import WhatsAppMessage from '../../models/WhatsAppMessage.model.js';
import Registration from '../../models/Registration.model.js';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';
import { getClientStatus, sendImageMessage } from './whatsapp.client.js';
import { generateEntryQrPng } from './whatsapp.qr.js';
import { buildRegistrationCaption } from './whatsapp.messages.js';
import { toWhatsAppJid, maskPhone } from './whatsapp.phone.js';
import { backoffMs } from './whatsapp.queue.js';
import { patchWhatsAppConfig } from './whatsapp.config-store.js';

let workerTimer = null;
let ticking = false;
let consecutiveFailures = 0;
let circuitOpenUntil = 0;
let lastProcessedAt = null;
/** @type {number | null} */
let nextProcessAt = null;
/** @type {'circuit' | 'disconnected' | 'disabled' | null} */
let pauseReason = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSendDelayMs() {
  const min = config.whatsapp.minDelayMs;
  const max = Math.max(min, config.whatsapp.maxDelayMs);
  if (max <= 0) return 0;
  return min + Math.floor(Math.random() * (max - min + 1));
}

function isCircuitOpen() {
  return Date.now() < circuitOpenUntil;
}

export function getWorkerRuntimeStatus() {
  const client = getClientStatus();
  const circuit = isCircuitOpen();
  const running = Boolean(workerTimer);
  let paused = false;
  let reason = pauseReason;

  if (!config.whatsapp.enabled) {
    paused = true;
    reason = 'disabled';
  } else if (circuit) {
    paused = true;
    reason = 'circuit';
  } else if (!client.connected) {
    paused = true;
    reason = 'disconnected';
  }

  return {
    running,
    paused,
    pauseReason: paused ? reason : null,
    consecutiveFailures,
    lastProcessedAt: lastProcessedAt ? new Date(lastProcessedAt) : null,
    nextProcessAt: nextProcessAt ? new Date(nextProcessAt) : null,
    circuitOpenUntil: circuit ? new Date(circuitOpenUntil) : null,
    maxConcurrentSends: config.whatsapp.maxConcurrentSends,
  };
}

async function syncRegistrationWhatsApp(registrationId, patch) {
  if (!registrationId) return;
  await Registration.updateOne({ _id: registrationId }, { $set: patch }).catch(() => undefined);
}

/**
 * After crash/restart: jobs left in "processing" were never ack'd as sent → pending again.
 */
export async function recoverStuckProcessingJobs() {
  const now = new Date();
  const result = await WhatsAppMessage.updateMany(
    { status: 'processing' },
    {
      $set: {
        status: 'pending',
        processingAt: null,
        nextAttemptAt: now,
        lastError: 'Recovered after worker restart (was processing)',
      },
    },
  );
  if (result.modifiedCount > 0) {
    logger.info(
      { count: result.modifiedCount },
      'Recovered stuck WhatsApp processing jobs to pending',
    );
  }
  return result.modifiedCount;
}

async function claimNextJob() {
  const now = new Date();
  return WhatsAppMessage.findOneAndUpdate(
    {
      status: 'pending',
      attempts: { $lt: config.whatsapp.maxAttempts },
      nextAttemptAt: { $lte: now },
    },
    { $set: { status: 'processing', processingAt: now } },
    { sort: { queuedAt: 1, nextAttemptAt: 1, createdAt: 1 }, new: true },
  );
}

function openCircuitBreaker(lastError) {
  consecutiveFailures += 1;
  if (consecutiveFailures < config.whatsapp.maxConsecutiveFailures) return;

  circuitOpenUntil = Date.now() + config.whatsapp.cooldownMs;
  nextProcessAt = circuitOpenUntil;
  pauseReason = 'circuit';
  logger.warn(
    {
      consecutiveFailures,
      cooldownMs: config.whatsapp.cooldownMs,
      lastError: String(lastError || '').slice(0, 200),
    },
    'Circuit breaker activated — WhatsApp queue paused',
  );
}

function resetCircuitOnSuccess() {
  if (consecutiveFailures > 0 || isCircuitOpen()) {
    logger.info('Queue resumed after successful send (circuit failure counter reset)');
  }
  consecutiveFailures = 0;
  if (circuitOpenUntil > Date.now()) {
    circuitOpenUntil = 0;
  }
  pauseReason = null;
}

async function processOne(job) {
  const jid = toWhatsAppJid(job.phone);
  if (!jid) {
    job.status = 'failed';
    job.attempts = config.whatsapp.maxAttempts;
    job.lastError = 'Invalid phone for WhatsApp';
    job.failedAt = new Date();
    job.processingAt = null;
    await job.save();
    await syncRegistrationWhatsApp(job.registrationId, {
      'whatsapp.status': 'failed',
      'whatsapp.lastError': job.lastError,
    });
    await patchWhatsAppConfig({ lastMessageFailedAt: new Date() }).catch(() => undefined);
    openCircuitBreaker(job.lastError);
    lastProcessedAt = Date.now();
    logger.warn(
      { id: job._id.toString(), phone: maskPhone(job.phone) },
      'Message failed — invalid phone',
    );
    return;
  }

  // Safety: never send while offline (should not claim when offline)
  const client = getClientStatus();
  if (!client.connected) {
    job.status = 'pending';
    job.processingAt = null;
    job.nextAttemptAt = new Date();
    // Do not treat disconnect as a send attempt
    await job.save();
    pauseReason = 'disconnected';
    logger.info('WhatsApp disconnected — job returned to pending (not attempted)');
    return;
  }

  job.attempts += 1;

  try {
    const { buffer } = await generateEntryQrPng(job.entryCode);
    const caption = buildRegistrationCaption({
      fullName: job.fullName,
      entryCode: job.entryCode,
      totalPeople: job.totalPeople,
    });

    const result = await sendImageMessage(jid, buffer, caption);
    const now = new Date();
    job.status = 'sent';
    job.messageId = result?.key?.id ?? null;
    job.sentAt = now;
    job.lastError = null;
    job.failedAt = null;
    job.processingAt = null;
    await job.save();

    await syncRegistrationWhatsApp(job.registrationId, {
      'whatsapp.status': 'sent',
      'whatsapp.sentAt': now,
      'whatsapp.lastError': null,
    });
    await patchWhatsAppConfig({ lastMessageSentAt: now, lastHeartbeatAt: now }).catch(() => undefined);

    resetCircuitOnSuccess();
    lastProcessedAt = Date.now();

    logger.info(
      { id: job._id.toString(), phone: maskPhone(job.phone) },
      'Message sent',
    );
  } catch (err) {
    const maxed = job.attempts >= config.whatsapp.maxAttempts;
    const now = new Date();
    const errMsg = String(err?.message ?? err).slice(0, 500);
    job.status = maxed ? 'failed' : 'pending';
    job.lastError = errMsg;
    job.processingAt = null;
    job.nextAttemptAt = new Date(Date.now() + backoffMs(job.attempts));
    if (maxed) job.failedAt = now;
    await job.save();

    if (maxed) {
      await syncRegistrationWhatsApp(job.registrationId, {
        'whatsapp.status': 'failed',
        'whatsapp.lastError': job.lastError,
      });
      await patchWhatsAppConfig({ lastMessageFailedAt: now }).catch(() => undefined);
    }

    openCircuitBreaker(errMsg);
    lastProcessedAt = Date.now();

    logger.warn(
      {
        id: job._id.toString(),
        phone: maskPhone(job.phone),
        attempts: job.attempts,
        err: job.lastError,
        nextAttemptAt: job.nextAttemptAt,
      },
      maxed ? 'Message failed' : 'Message failed — retry scheduled',
    );
  }
}

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    if (!config.whatsapp.enabled) {
      pauseReason = 'disabled';
      return;
    }

    const now = Date.now();
    if (now < circuitOpenUntil) {
      pauseReason = 'circuit';
      nextProcessAt = circuitOpenUntil;
      return;
    }

    // After cooldown: only resume when connection is healthy
    if (pauseReason === 'circuit' && circuitOpenUntil > 0 && now >= circuitOpenUntil) {
      const client = getClientStatus();
      if (!client.connected) {
        pauseReason = 'disconnected';
        logger.info('Circuit cooldown elapsed but WhatsApp still disconnected — waiting');
        return;
      }
      pauseReason = null;
      circuitOpenUntil = 0;
      logger.info('Queue resumed after circuit breaker cooldown');
    }

    const client = getClientStatus();
    if (!client.connected) {
      pauseReason = 'disconnected';
      // Leave all pending messages untouched — do not claim
      return;
    }

    if (pauseReason === 'disconnected') {
      pauseReason = null;
      logger.info('WhatsApp connected — queue processing resumed');
    }

    // Exactly one message at a time (maxConcurrentSends capped at 1)
    const batch = Math.min(1, config.whatsapp.maxConcurrentSends);
    for (let i = 0; i < batch; i += 1) {
      const job = await claimNextJob();
      if (!job) {
        nextProcessAt = null;
        break;
      }

      await processOne(job);

      // Controlled delay between sends (not a claimed WhatsApp-safe rate)
      const delay = randomSendDelayMs();
      if (delay > 0) {
        nextProcessAt = Date.now() + delay;
        await sleep(delay);
      } else {
        nextProcessAt = null;
      }

      // If we disconnected mid-batch or circuit opened, stop
      if (!getClientStatus().connected || isCircuitOpen()) break;
    }
  } catch (err) {
    logger.error({ err: err?.message }, 'WhatsApp worker tick error');
  } finally {
    ticking = false;
  }
}

export async function startWhatsAppWorker() {
  if (!config.whatsapp.enabled) return;
  if (workerTimer) return;

  try {
    await recoverStuckProcessingJobs();
  } catch (err) {
    logger.warn({ err: err?.message }, 'Stuck job recovery failed (continuing)');
  }

  workerTimer = setInterval(() => {
    void tick();
  }, config.whatsapp.workerIntervalMs);
  setTimeout(() => void tick(), 3_000);
  logger.info(
    {
      intervalMs: config.whatsapp.workerIntervalMs,
      minDelayMs: config.whatsapp.minDelayMs,
      maxDelayMs: config.whatsapp.maxDelayMs,
      maxConcurrentSends: config.whatsapp.maxConcurrentSends,
    },
    'Queue started',
  );
}

export function stopWhatsAppWorker() {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
  }
  logger.info('Queue paused (worker stopped)');
}
