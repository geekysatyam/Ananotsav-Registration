import fs from 'fs';
import path from 'path';
import config from '../../config/env.js';

export function resolveSessionDir() {
  return path.resolve(config.whatsapp.sessionDir);
}

export function ensureSessionDir() {
  const dir = resolveSessionDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** True if Baileys multi-file auth appears to have credentials on disk */
export function hasPersistedSession() {
  const credsPath = path.join(resolveSessionDir(), 'creds.json');
  return fs.existsSync(credsPath);
}
