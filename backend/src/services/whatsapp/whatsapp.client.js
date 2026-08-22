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
let onLoggedOutHook = null;

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

function mapDisconnect(error) {
  if (!error) return { statusCode: null, shouldReconnect: true, loggedOut: false };
  const statusCode = error instanceof Boom ? error.output?.statusCode : error?.output?.statusCode;
  const loggedOut = statusCode === DisconnectReason.loggedOut;
  return { statusCode, shouldReconnect: !loggedOut && !intentionalStop && !pairingMode, loggedOut };
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

  if (sock) {
    try {
      sock.ev.removeAllListeners('connection.update');
      sock.ev.removeAllListeners('creds.update');
    } catch {
      /* ignore */
    }
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

  sock.ev.on('creds.update', saveCreds);

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
      const { statusCode, shouldReconnect, loggedOut } = mapDisconnect(lastDisconnect?.error);
      lastDisconnectReason = statusCode ?? 'unknown';
      authenticated = false;
      const now = new Date();
      logger.warn({ statusCode }, 'WhatsApp disconnected');

      void (async () => {
        let previousStatus = 'disconnected';
        try {
          const cfg = await getOrCreateWhatsAppConfig();
          previousStatus = cfg.status;
        } catch {
          /* ignore */
        }

        if (loggedOut) {
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
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            startWhatsAppClient(opts).catch((err) => {
              logger.error({ err: err?.message }, 'WhatsApp reconnect failed');
              patchWhatsAppConfig({ status: 'error', disconnectReason: err?.message }).catch(
                () => undefined,
              );
            });
          }, 5_000);
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
  if (!current) return;
  try {
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
