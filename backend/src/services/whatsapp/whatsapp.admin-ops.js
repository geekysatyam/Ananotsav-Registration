import WhatsAppMessage from '../../models/WhatsAppMessage.model.js';
import Registration from '../../models/Registration.model.js';
import config from '../../config/env.js';
import logger from '../../utils/logger.js';
import {
  startWhatsAppClient,
  stopWhatsAppClient,
  getClientStatus,
  getWhatsAppSocket,
  getLatestPairingQr,
  clearLatestPairingQr,
} from './whatsapp.client.js';
import { clearWhatsAppSessionFiles } from './whatsapp.session-clear.js';
import { hasPersistedSession } from './whatsapp.session.js';
import {
  getOrCreateWhatsAppConfig,
  patchWhatsAppConfig,
  maskConfigPhone,
} from './whatsapp.config-store.js';
import { normalizeWhatsAppDigits, maskPhone, toWhatsAppJid } from './whatsapp.phone.js';
import { enqueueRegistrationConfirmation } from './whatsapp.queue.js';
import { startWhatsAppWorker, stopWhatsAppWorker } from './whatsapp.worker.js';

let pairingActive = false;

async function notifyLogoutOnce(previousStatus, phoneNumber) {
  if (previousStatus !== 'connected' && previousStatus !== 'connecting') return;
  const cfg = await getOrCreateWhatsAppConfig();
  if (cfg.lastLogoutNotifiedAt) {
    const age = Date.now() - new Date(cfg.lastLogoutNotifiedAt).getTime();
    if (age < 60 * 60 * 1000) return; // at most once per hour
  }
  const pending = await WhatsAppMessage.countDocuments({
    status: { $in: ['pending', 'processing'] },
  });
  const masked = maskConfigPhone(phoneNumber) || 'unknown';
  const message =
    `The Anandotsav WhatsApp account has been logged out and requires re-pairing.\n\n` +
    `Number: ${masked}\n` +
    `Detected: ${new Date().toISOString()}\n` +
    `Pending messages: ${pending}\n\n` +
    `Please reconnect WhatsApp from the admin panel.`;

  // No email infra in project — structured log + admin banner
  logger.error({ pending, phone: masked }, `ADMIN ALERT: Anandotsav WhatsApp requires attention\n${message}`);

  await patchWhatsAppConfig({
    lastLogoutNotifiedAt: new Date(),
    adminAlert: {
      type: 'logged_out',
      message:
        'WhatsApp has been logged out and requires re-pairing. Open Admin → WhatsApp to pair again.',
      at: new Date(),
    },
  });
}

/** Called from client on logout transition */
export async function handleWhatsAppLoggedOut(previousStatus, phoneNumber) {
  await notifyLogoutOnce(previousStatus, phoneNumber);
  try {
    clearWhatsAppSessionFiles();
  } catch {
    /* ignore */
  }
}

export async function cancelPendingMessages(reason) {
  const result = await WhatsAppMessage.updateMany(
    { status: { $in: ['pending', 'processing'] } },
    {
      $set: {
        status: 'cancelled',
        processingAt: null,
        lastError: reason || 'Cancelled due to WhatsApp number change',
        failedAt: new Date(),
      },
    },
  );
  return result.modifiedCount ?? 0;
}

export async function startAdminPairing() {
  if (!config.whatsapp.enabled) {
    const err = new Error('WhatsApp is disabled (WHATSAPP_ENABLED=false)');
    err.code = 'WHATSAPP_DISABLED';
    throw err;
  }
  pairingActive = true;
  clearLatestPairingQr();
  stopWhatsAppWorker();
  await stopWhatsAppClient();
  await patchWhatsAppConfig({ status: 'pairing', disconnectReason: null });

  await startWhatsAppClient({
    printQr: false,
    pairingMode: true,
    onQr: () => {
      patchWhatsAppConfig({ status: 'pairing' }).catch(() => undefined);
    },
  });
  startWhatsAppWorker();
  return { status: 'pairing', message: 'Scan the pairing QR in the admin panel' };
}

export function getAdminPairingQr() {
  return {
    qr: getLatestPairingQr(),
    client: getClientStatus(),
  };
}

export async function requestAdminPairingCode(phoneInput) {
  if (!config.whatsapp.enabled) {
    const err = new Error('WhatsApp is disabled');
    err.code = 'WHATSAPP_DISABLED';
    throw err;
  }
  const digits = normalizeWhatsAppDigits(phoneInput);
  if (!digits) {
    const err = new Error('Enter a valid Indian mobile number');
    err.code = 'INVALID_PHONE';
    throw err;
  }

  if (!pairingActive && !getWhatsAppSocket()) {
    await startAdminPairing();
    // brief wait for socket
    await new Promise((r) => setTimeout(r, 1500));
  }

  const sock = getWhatsAppSocket();
  if (!sock?.requestPairingCode) {
    const err = new Error('Pairing code is not available; use QR pairing');
    err.code = 'PAIRING_CODE_UNSUPPORTED';
    throw err;
  }

  // Baileys expects country+number without +
  const code = await sock.requestPairingCode(digits);
  await patchWhatsAppConfig({ status: 'pairing' });
  // Do not log the code
  return { pairingCode: code, phone: maskPhone(digits) };
}

export async function cancelAdminPairing() {
  pairingActive = false;
  clearLatestPairingQr();
  const client = getClientStatus();
  if (client.connected) {
    await patchWhatsAppConfig({ status: 'connected' });
    return { status: 'connected' };
  }
  // Do not wipe a valid session on cancel
  await stopWhatsAppClient();
  if (hasPersistedSession()) {
    await startWhatsAppClient({ printQr: false });
    startWhatsAppWorker();
    await patchWhatsAppConfig({ status: 'connecting' });
    return { status: 'connecting' };
  }
  await patchWhatsAppConfig({ status: 'not_configured' });
  return { status: 'not_configured' };
}

export async function changeWhatsAppNumber() {
  if (!config.whatsapp.enabled) {
    const err = new Error('WhatsApp is disabled');
    err.code = 'WHATSAPP_DISABLED';
    throw err;
  }
  pairingActive = false;
  stopWhatsAppWorker();
  await stopWhatsAppClient();
  const cancelled = await cancelPendingMessages(
    'Cancelled due to WhatsApp number change — retry manually if needed',
  );
  clearWhatsAppSessionFiles();
  await patchWhatsAppConfig({
    status: 'not_configured',
    phoneNumber: null,
    displayName: null,
    connectedAt: null,
    disconnectReason: 'number_change',
    lastDisconnectedAt: new Date(),
  });
  logger.info({ cancelled }, 'WhatsApp number change: session cleared, pending cancelled');
  return { status: 'not_configured', cancelledMessages: cancelled };
}

export async function reconnectWhatsApp() {
  if (!config.whatsapp.enabled) {
    const err = new Error('WhatsApp is disabled');
    err.code = 'WHATSAPP_DISABLED';
    throw err;
  }
  const cfg = await getOrCreateWhatsAppConfig();
  if (cfg.status === 'logged_out' || !hasPersistedSession()) {
    const err = new Error(
      'WhatsApp session is no longer valid. Please pair the account again.',
    );
    err.code = 'SESSION_INVALID';
    throw err;
  }
  pairingActive = false;
  stopWhatsAppWorker();
  await stopWhatsAppClient();
  await patchWhatsAppConfig({ status: 'connecting' });
  await startWhatsAppClient({ printQr: false });
  startWhatsAppWorker();
  return { status: 'connecting' };
}

export async function disconnectWhatsApp() {
  pairingActive = false;
  stopWhatsAppWorker();
  await stopWhatsAppClient();
  await patchWhatsAppConfig({
    status: 'disconnected',
    lastDisconnectedAt: new Date(),
    disconnectReason: 'admin_disconnect',
  });
  // Keep session files so reconnect works
  return { status: 'disconnected' };
}

export async function ackAdminAlert() {
  await patchWhatsAppConfig({
    adminAlert: { type: null, message: null, at: null },
  });
  return { ok: true };
}

export async function listWhatsAppMessages({
  status,
  search,
  registrationId,
  messageType,
  page = 1,
  limit = 20,
  from,
  to,
} = {}) {
  const filter = {};
  if (status) filter.status = status;
  if (messageType) filter.messageType = messageType;
  if (registrationId) filter.registrationId = registrationId;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (search) {
    const q = String(search).trim();
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ entryCode: re }, { fullName: re }, { phone: re }];
    if (/^\d{4}$/.test(q)) {
      filter.$or.push({ phone: new RegExp(`${q}$`) });
    }
  }

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    WhatsAppMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    WhatsAppMessage.countDocuments(filter),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r._id.toString(),
      registrationId: r.registrationId?.toString?.() ?? null,
      entryCode: r.entryCode,
      fullName: r.fullName,
      phone: maskPhone(r.phone),
      messageType: r.messageType,
      status: r.status,
      attempts: r.attempts,
      lastError: r.lastError,
      queuedAt: r.queuedAt,
      processingAt: r.processingAt ?? null,
      sentAt: r.sentAt,
      failedAt: r.failedAt,
      nextAttemptAt: r.nextAttemptAt ?? null,
      createdAt: r.createdAt,
    })),
    total,
    page,
    limit,
  };
}

export async function retryWhatsAppMessage(messageId) {
  const job = await WhatsAppMessage.findById(messageId);
  if (!job) {
    const err = new Error('Message not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (!['failed', 'cancelled', 'pending'].includes(job.status) && job.status !== 'sent') {
    // allow retry of failed/cancelled; if sent, no-op error
  }
  if (job.status === 'sent') {
    const err = new Error('Message already sent');
    err.code = 'ALREADY_SENT';
    throw err;
  }

  if (job.registrationId) {
    const reg = await Registration.findById(job.registrationId)
      .select('registrationSource')
      .lean();
    if (reg?.registrationSource === 'desk-manual') {
      const err = new Error('Desk registrations do not receive WhatsApp QR');
      err.code = 'DESK_NO_WHATSAPP';
      throw err;
    }
  }

  job.status = 'pending';
  job.attempts = 0;
  job.lastError = null;
  job.failedAt = null;
  job.processingAt = null;
  job.nextAttemptAt = new Date();
  job.queuedAt = new Date();
  await job.save();

  await Registration.updateOne(
    { _id: job.registrationId },
    {
      $set: {
        'whatsapp.status': 'pending',
        'whatsapp.lastError': null,
        'whatsapp.sentAt': null,
      },
    },
  ).catch(() => undefined);

  return { id: job._id.toString(), status: 'pending' };
}

export async function retryWhatsAppByRegistration(registrationId) {
  let job = await WhatsAppMessage.findOne({
    uniqueKey: `${registrationId}:registration-qr`,
  });
  if (job) {
    return retryWhatsAppMessage(job._id.toString());
  }

  const reg = await Registration.findById(registrationId).lean();
  if (!reg) {
    const err = new Error('Registration not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (reg.registrationSource === 'desk-manual') {
    const err = new Error('Desk registrations do not receive WhatsApp QR');
    err.code = 'DESK_NO_WHATSAPP';
    throw err;
  }
  if (!toWhatsAppJid(reg.phone)) {
    const err = new Error('Invalid phone on registration');
    err.code = 'INVALID_PHONE';
    throw err;
  }

  await enqueueRegistrationConfirmation({
    registrationId: reg._id.toString(),
    phone: reg.phone,
    entryCode: reg.entryCode,
    fullName: reg.fullName,
    totalPeople: 1,
  });
  return { status: 'pending' };
}

export { pairingActive };
