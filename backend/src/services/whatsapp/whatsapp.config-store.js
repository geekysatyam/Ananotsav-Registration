import WhatsAppConfig from '../../models/WhatsAppConfig.model.js';
import config from '../../config/env.js';
import { maskPhone } from './whatsapp.phone.js';

const KEY = 'default';

export async function getOrCreateWhatsAppConfig() {
  let doc = await WhatsAppConfig.findOne({ key: KEY });
  if (!doc) {
    doc = await WhatsAppConfig.create({
      key: KEY,
      enabled: config.whatsapp.enabled,
      status: config.whatsapp.enabled ? 'not_configured' : 'not_configured',
    });
  }
  return doc;
}

export async function patchWhatsAppConfig(patch) {
  return WhatsAppConfig.findOneAndUpdate(
    { key: KEY },
    { $set: { ...patch, enabled: config.whatsapp.enabled } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export function maskConfigPhone(phoneNumber) {
  if (!phoneNumber) return null;
  const d = String(phoneNumber).replace(/\D/g, '');
  if (d.length < 4) return '****';
  if (d.length >= 12 && d.startsWith('91')) {
    return `+91 ******${d.slice(-4)}`;
  }
  return maskPhone(d);
}

/** Extract bare digits from Baileys user id like 9198…:device@s.whatsapp.net */
export function parseBaileysUserId(userId) {
  if (!userId) return null;
  const base = String(userId).split(':')[0].split('@')[0];
  const digits = base.replace(/\D/g, '');
  return digits || null;
}
