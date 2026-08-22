export {
  initializeWhatsApp,
  shutdownWhatsApp,
  getStatus,
  queueRegistrationWhatsApp,
  enqueueRegistrationConfirmation,
  markWhatsAppInitialized,
  markWhatsAppUninitialized,
} from './whatsapp.service.js';

export {
  startWhatsAppClient,
  stopWhatsAppClient,
  getClientStatus,
  getWhatsAppSocket,
  getLatestPairingQr,
  clearLatestPairingQr,
  setLoggedOutHook,
} from './whatsapp.client.js';
export { hasPersistedSession, resolveSessionDir, ensureSessionDir } from './whatsapp.session.js';
export { generateEntryQrPng } from './whatsapp.qr.js';
export { buildRegistrationCaption } from './whatsapp.messages.js';
export { toWhatsAppJid, maskPhone, normalizeWhatsAppDigits } from './whatsapp.phone.js';
export { getOrCreateWhatsAppConfig, patchWhatsAppConfig } from './whatsapp.config-store.js';
export {
  startWhatsAppWorker,
  stopWhatsAppWorker,
  getWorkerRuntimeStatus,
  recoverStuckProcessingJobs,
} from './whatsapp.worker.js';
