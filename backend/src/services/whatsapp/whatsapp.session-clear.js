import fs from 'fs';
import path from 'path';
import { resolveSessionDir, ensureSessionDir } from './whatsapp.session.js';
import logger from '../../utils/logger.js';

/** Wipe Baileys multi-file auth (after stop). Does not touch MongoDB. */
export function clearWhatsAppSessionFiles() {
  const dir = resolveSessionDir();
  try {
    if (fs.existsSync(dir)) {
      for (const name of fs.readdirSync(dir)) {
        fs.rmSync(path.join(dir, name), { recursive: true, force: true });
      }
    }
    ensureSessionDir();
    logger.info('WhatsApp session files cleared');
  } catch (err) {
    logger.error({ err: err?.message }, 'Failed to clear WhatsApp session files');
    throw err;
  }
}
