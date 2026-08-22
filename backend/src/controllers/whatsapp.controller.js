import { success, error } from '../utils/apiResponse.js';
import { getStatus } from '../services/whatsapp/whatsapp.service.js';
import {
  startAdminPairing,
  getAdminPairingQr,
  requestAdminPairingCode,
  cancelAdminPairing,
  changeWhatsAppNumber,
  reconnectWhatsApp,
  disconnectWhatsApp,
  ackAdminAlert,
  listWhatsAppMessages,
  retryWhatsAppMessage,
  retryWhatsAppByRegistration,
} from '../services/whatsapp/whatsapp.admin-ops.js';
import {
  markWhatsAppInitialized,
  markWhatsAppUninitialized,
} from '../services/whatsapp/whatsapp.service.js';
import logger from '../utils/logger.js';

function mapOpsError(err, res) {
  const code = err?.code || 'WHATSAPP_ERROR';
  const status =
    code === 'NOT_FOUND'
      ? 404
      : code === 'WHATSAPP_DISABLED' ||
          code === 'SESSION_INVALID' ||
          code === 'INVALID_PHONE' ||
          code === 'ALREADY_SENT' ||
          code === 'DESK_NO_WHATSAPP'
        ? 400
        : 500;
  logger.warn({ code, err: err?.message }, 'WhatsApp admin op failed');
  return error(res, code, err?.message || 'WhatsApp operation failed', status);
}

export async function whatsappStatus(_req, res) {
  const status = await getStatus();
  return success(res, status);
}

export async function whatsappPairStart(_req, res) {
  try {
    markWhatsAppUninitialized();
    const data = await startAdminPairing();
    markWhatsAppInitialized();
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}

export async function whatsappPairQr(_req, res) {
  const data = getAdminPairingQr();
  // Temporary pairing QR string only — not Baileys credentials
  return success(res, {
    qr: data.qr,
    hasQr: Boolean(data.qr),
    connected: data.client.connected,
  });
}

export async function whatsappPairingCode(req, res) {
  try {
    const phone = req.body?.phone;
    const data = await requestAdminPairingCode(phone);
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}

export async function whatsappPairCancel(_req, res) {
  try {
    const data = await cancelAdminPairing();
    markWhatsAppInitialized();
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}

export async function whatsappChangeNumber(_req, res) {
  try {
    markWhatsAppUninitialized();
    const data = await changeWhatsAppNumber();
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}

export async function whatsappReconnect(_req, res) {
  try {
    markWhatsAppUninitialized();
    const data = await reconnectWhatsApp();
    markWhatsAppInitialized();
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}

export async function whatsappDisconnect(_req, res) {
  try {
    const data = await disconnectWhatsApp();
    markWhatsAppUninitialized();
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}

export async function whatsappAckAlert(_req, res) {
  const data = await ackAdminAlert();
  return success(res, data);
}

export async function whatsappListMessages(req, res) {
  const q = req.query || {};
  const data = await listWhatsAppMessages({
    status: q.status || undefined,
    search: q.search || undefined,
    registrationId: q.registrationId || undefined,
    messageType: q.messageType || undefined,
    page: Number(q.page) || 1,
    limit: Math.min(100, Number(q.limit) || 20),
    from: q.from || undefined,
    to: q.to || undefined,
  });
  return success(res, data);
}

export async function whatsappRetryMessage(req, res) {
  try {
    const data = await retryWhatsAppMessage(req.params.id);
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}

export async function whatsappRetryRegistration(req, res) {
  try {
    const data = await retryWhatsAppByRegistration(req.params.id);
    return success(res, data);
  } catch (err) {
    return mapOpsError(err, res);
  }
}
