import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import logger from '../../utils/logger.js';
import { ensureSessionDir } from './whatsapp.session.js';
import {
  getOrCreateWhatsAppConfig,
  patchWhatsAppConfig,
  parseBaileysUserId,
} from './whatsapp.config-store.js';

let sock = null;
let connectionState = 'close';
let authenticated = false;
let lastDisconnectReason = null;
let reconnectTimer = null;
let intentionalStop = false;
let pairingQr = null;
let heartbeatTimer = null;
let pairingMode = false;
/** True once Baileys has written registered creds (QR/pair accepted). */
let sessionRegistered = false;
let onLoggedOutHook = null;

const POST_PAIR_RESTART_MS = 1_500;
const NORMAL_RECONNECT_MS = 5_000;

export function setLoggedOutHook(fn) {
  onLoggedOutHook = fn;
}

export function getLatestPairingQr() {
  return pairingQr;
}

export function clearLatestPairingQr() {
  pairingQr = null;
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (connectionState !== 'open') return;
    patchWhatsAppConfig({ lastHeartbeatAt: new Date(), status: 'connected' }).catch(() => undefined);
  }, 60_000);
}

function extractStatusCode(error) {
  if (!error) return null;
  if (typeof error.output?.statusCode === 'number') return error.output.statusCode;
  if (error instanceof Boom && typeof error.output?.statusCode === 'number') {
    return error.output.statusCode;
  }
  if (typeof error.statusCode === 'number') return error.statusCode;
  if (typeof error.data === 'number') return error.data;
  return null;
}

function mapDisconnect(error) {
  if (!error) {
    return { statusCode: null, shouldReconnect: true, loggedOut: false, restartRequired: false };
  }
  const statusCode = extractStatusCode(error);
  const loggedOut = statusCode === DisconnectReason.loggedOut;
  // 515: after QR/pairing success Baileys must restart with saved credentials
  const restartRequired =
    statusCode === DisconnectReason.restartRequired || statusCode === 515;
  // Never let pairingMode block a 515 / post-pair restart
  const shouldReconnect =
    !intentionalStop && !loggedOut && (restartRequired || !pairingMode);
  return { statusCode, shouldReconnect, loggedOut, restartRequired };
}

function scheduleRestart(opts, { reason, delayMs }) {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    startWhatsAppClient({ ...opts, pairingMode: false, printQr: false }).catch((err) => {
      logger.error({ err: err?.message, reason }, 'WhatsApp restart failed');
      patchWhatsAppConfig({ status: 'error', disconnectReason: err?.message }).catch(() => undefined);
    });
  }, delayMs);
}

/**
 * @param {{ printQr?: boolean, onQr?: (qr: string) => void, pairingMode?: boolean }} [opts]
 */
export async function startWhatsAppClient(opts = {}) {
  intentionalStop = false;
  pairingMode = Boolean(opts.pairingMode);
  const sessionDir = ensureSessionDir();
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));
  sessionRegistered = Boolean(state?.creds?.registered || state?.creds?.me);

  if (sock) {
    try {
      sock.ev.removeAllListeners('connection.update');
      sock.ev.removeAllListeners('creds.update');
      sock.end?.(undefined);
    } catch {
      /* ignore */
    }
    sock = null;
  }

  connectionState = 'connecting';
  if (!pairingMode) {
    await patchWhatsAppConfig({ status: 'connecting' }).catch(() => undefined);
  }

  sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: Boolean(opts.printQr),
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    if (state?.creds?.registered || state?.creds?.me) {
      sessionRegistered = true;
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      pairingQr = qr;
      opts.onQr?.(qr);
      if (pairingMode) {
        logger.info('WhatsApp pairing QR ready for admin panel');
      } else {
        logger.info('WhatsApp is not authenticated. Pair via admin panel or npm run whatsapp:login');
      }
    }

    if (connection === 'open') {
      connectionState = 'open';
      authenticated = true;
      sessionRegistered = true;
      pairingQr = null;
      pairingMode = false;
      lastDisconnectReason = null;
      const now = new Date();
      const phoneNumber = parseBaileysUserId(sock?.user?.id);
      const displayName = sock?.user?.name || sock?.user?.verifiedName || null;
      startHeartbeat();
      patchWhatsAppConfig({
        status: 'connected',
        phoneNumber,
        displayName,
        connectedAt: now,
        lastConnectedAt: now,
        lastHeartbeatAt: now,
        disconnectReason: null,
        adminAlert: { type: null, message: null, at: null },
      }).catch(() => undefined);
      logger.info('WhatsApp connected');
    }

    if (connection === 'connecting') {
      connectionState = 'connecting';
      if (!pairingMode) {
        patchWhatsAppConfig({ status: 'connecting' }).catch(() => undefined);
      }
    }

    if (connection === 'close') {
      connectionState = 'close';
      stopHeartbeat();
      const { statusCode, shouldReconnect, loggedOut, restartRequired } = mapDisconnect(
        lastDisconnect?.error,
      );
      lastDisconnectReason = statusCode ?? 'unknown';
      authenticated = false;
      const now = new Date();
      logger.warn(
        { statusCode, restartRequired, pairingMode, sessionRegistered },
        'WhatsApp disconnected',
      );

      void (async () => {
        let previousStatus = 'disconnected';
        try {
          const cfg = await getOrCreateWhatsAppConfig();
          previousStatus = cfg.status;
        } catch {
          /* ignore */
        }

        if (loggedOut) {
          sessionRegistered = false;
          const phone = (await getOrCreateWhatsAppConfig().catch(() => null))?.phoneNumber;
          await patchWhatsAppConfig({
            status: 'logged_out',
            lastDisconnectedAt: now,
            disconnectReason: 'logged_out',
            phoneNumber: null,
            displayName: null,
          }).catch(() => undefined);
          if (typeof onLoggedOutHook === 'function') {
            await onLoggedOutHook(previousStatus, phone).catch(() => undefined);
          }
          logger.error('WhatsApp logged out — re-pair from admin panel');
          return;
        }

        if (intentionalStop) {
          return;
        }

        // creds.update can land just after close; wait briefly so sessionRegistered is accurate
        if (pairingMode && !restartRequired && !sessionRegistered) {
          await new Promise((r) => setTimeout(r, 400));
          if (state?.creds?.registered || state?.creds?.me) {
            sessionRegistered = true;
          }
        }

        // After successful QR/pair Baileys closes (515) — always restart with saved session.
        // pairingMode must NOT block this path.
        const needsPostPairRestart =
          restartRequired || (pairingMode && sessionRegistered);

        if (needsPostPairRestart) {
          pairingMode = false;
          pairingQr = null;
          await patchWhatsAppConfig({
            status: 'connecting',
            lastDisconnectedAt: now,
            disconnectReason: restartRequired ? '515_restart_required' : 'post_pair_restart',
          }).catch(() => undefined);
          logger.info(
            { statusCode, delayMs: POST_PAIR_RESTART_MS, sessionRegistered },
            'Pairing saved — restarting WhatsApp connection with saved session',
          );
          scheduleRestart(opts, { reason: 'post_pair', delayMs: POST_PAIR_RESTART_MS });
          return;
        }

        // Still waiting for QR scan — do not reconnect (would spam new QRs)
        if (pairingMode) {
          await patchWhatsAppConfig({
            status: 'pairing',
            lastDisconnectedAt: now,
            disconnectReason: String(statusCode ?? 'pairing_wait'),
          }).catch(() => undefined);
          return;
        }

        await patchWhatsAppConfig({
          status: 'disconnected',
          lastDisconnectedAt: now,
          disconnectReason: String(statusCode ?? 'connection_closed'),
        }).catch(() => undefined);

        if (shouldReconnect) {
          scheduleRestart(opts, { reason: 'reconnect', delayMs: NORMAL_RECONNECT_MS });
        }
      })();
    }
  });

  return sock;
}

export async function stopWhatsAppClient() {
  intentionalStop = true;
  pairingMode = false;
  stopHeartbeat();
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  const current = sock;
  sock = null;
  connectionState = 'close';
  authenticated = false;
  pairingQr = null;
  if (!current) return;
  try {
    current.ev.removeAllListeners('connection.update');
    current.ev.removeAllListeners('creds.update');
    current.end?.(undefined);
  } catch {
    /* ignore */
  }
}

export function getWhatsAppSocket() {
  return sock;
}

export function getClientStatus() {
  return {
    connectionState,
    authenticated: authenticated && connectionState === 'open',
    connected: connectionState === 'open',
    lastDisconnectReason,
    hasPairingQr: Boolean(pairingQr),
    pairingMode,
    sessionRegistered,
  };
}

export async function sendImageMessage(jid, imageBuffer, caption) {
  if (!sock || connectionState !== 'open') {
    throw new Error('WhatsApp is not connected');
  }
  const result = await sock.sendMessage(jid, {
    image: imageBuffer,
    caption,
  });
  return result;
}
