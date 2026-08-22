import config from '../../config/env.js';
import logger from '../../utils/logger.js';
import WhatsAppMessage from '../../models/WhatsAppMessage.model.js';
import {
  startWhatsAppClient,
  stopWhatsAppClient,
  getClientStatus,
  setLoggedOutHook,
} from './whatsapp.client.js';
import { hasPersistedSession } from './whatsapp.session.js';
import { enqueueRegistrationConfirmation } from './whatsapp.queue.js';
import {
  startWhatsAppWorker,
  stopWhatsAppWorker,
  getWorkerRuntimeStatus,
} from './whatsapp.worker.js';
import {
  getOrCreateWhatsAppConfig,
  maskConfigPhone,
  patchWhatsAppConfig,
} from './whatsapp.config-store.js';
import { handleWhatsAppLoggedOut } from './whatsapp.admin-ops.js';

let initialized = false;

export async function initializeWhatsApp() {
  if (!config.whatsapp.enabled) {
    logger.info('WhatsApp disabled (WHATSAPP_ENABLED=false)');
    await patchWhatsAppConfig({ enabled: false, status: 'not_configured' }).catch(() => undefined);
    return { enabled: false };
  }
  if (initialized) return getStatus();

  setLoggedOutHook(handleWhatsAppLoggedOut);
  await getOrCreateWhatsAppConfig().catch(() => undefined);

  if (!hasPersistedSession()) {
    logger.warn('WhatsApp enabled but not authenticated. Pair from Admin → WhatsApp.');
    await patchWhatsAppConfig({ enabled: true, status: 'not_configured' }).catch(() => undefined);
  }

  try {
    await startWhatsAppClient({ printQr: false });
    startWhatsAppWorker();
    initialized = true;
  } catch (err) {
    logger.error({ err: err?.message }, 'WhatsApp initialize failed — registration continues');
    await patchWhatsAppConfig({ status: 'error', disconnectReason: err?.message }).catch(() => undefined);
    // Still start worker so queue recovers / waits for connect
    try {
      startWhatsAppWorker();
    } catch {
      /* ignore */
    }
  }

  return getStatus();
}

export async function shutdownWhatsApp() {
  stopWhatsAppWorker();
  await stopWhatsAppClient();
  initialized = false;
}

/** Allow admin ops to mark service as needing re-init after stop/start */
export function markWhatsAppUninitialized() {
  initialized = false;
}

export function markWhatsAppInitialized() {
  initialized = true;
}

export async function getStatus() {
  const client = getClientStatus();
  const queue = {
    pending: 0,
    processing: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
  };
  let sentToday = 0;
  let cfg = null;
  const worker = getWorkerRuntimeStatus();

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [pending, processing, sent, failed, cancelled, sentTodayCount, configDoc] =
      await Promise.all([
        WhatsAppMessage.countDocuments({ status: 'pending' }),
        WhatsAppMessage.countDocuments({ status: 'processing' }),
        WhatsAppMessage.countDocuments({ status: 'sent' }),
        WhatsAppMessage.countDocuments({ status: 'failed' }),
        WhatsAppMessage.countDocuments({ status: 'cancelled' }),
        WhatsAppMessage.countDocuments({ status: 'sent', sentAt: { $gte: startOfDay } }),
        getOrCreateWhatsAppConfig(),
      ]);
    queue.pending = pending;
    queue.processing = processing;
    queue.sent = sent;
    queue.failed = failed;
    queue.cancelled = cancelled;
    sentToday = sentTodayCount;
    cfg = configDoc;
  } catch {
    /* ignore */
  }

  // Stale heartbeat → don't claim connected
  let status = config.whatsapp.enabled ? cfg?.status || 'not_configured' : 'not_configured';
  if (status === 'connected' && cfg?.lastHeartbeatAt) {
    const age = Date.now() - new Date(cfg.lastHeartbeatAt).getTime();
    if (age > 5 * 60 * 1000 && !client.connected) {
      status = 'disconnected';
    }
  }
  if (client.connected) status = 'connected';

  return {
    enabled: config.whatsapp.enabled,
    status,
    connected: client.connected,
    authenticated: client.authenticated,
    connectionState: client.connectionState,
    hasPersistedSession: hasPersistedSession(),
    pairingSupported: true,
    pairingCodeSupported: true,
    phoneNumber: maskConfigPhone(cfg?.phoneNumber),
    displayName: cfg?.displayName ?? null,
    lastConnectedAt: cfg?.lastConnectedAt ?? null,
    lastDisconnectedAt: cfg?.lastDisconnectedAt ?? null,
    lastHeartbeatAt: cfg?.lastHeartbeatAt ?? null,
    lastMessageSentAt: cfg?.lastMessageSentAt ?? null,
    lastMessageFailedAt: cfg?.lastMessageFailedAt ?? null,
    disconnectReason: cfg?.disconnectReason ?? null,
    /** @deprecated prefer queue.* — kept for older UI */
    pendingMessages: queue.pending + queue.processing,
    failedMessages: queue.failed,
    sentToday,
    sentTotal: queue.sent,
    queue,
    worker,
    adminAlert: cfg?.adminAlert?.type
      ? {
          type: cfg.adminAlert.type,
          message: cfg.adminAlert.message,
          at: cfg.adminAlert.at,
        }
      : null,
  };
}

export async function queueRegistrationWhatsApp(result, primaryInput) {
  try {
    if (!config.whatsapp.enabled) return;
    const regs = result?.registrations ?? [];
    const primary = regs.find((r) => r.isPrimaryRegistrant) ?? regs[0];
    if (!primary?.id || !primary?.entryCode) return;

    await enqueueRegistrationConfirmation({
      registrationId: primary.id,
      phone: primaryInput.phone,
      entryCode: primary.entryCode,
      fullName: primary.fullName,
      totalPeople: regs.length,
    });
  } catch (err) {
    logger.error({ err: err?.message }, 'queueRegistrationWhatsApp failed (ignored)');
  }
}

export { enqueueRegistrationConfirmation };
