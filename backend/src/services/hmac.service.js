import crypto from 'crypto';
import config from '../config/env.js';

// Key derived once at startup — avoids re-deriving on every scan
const hmacKey = crypto.createSecretKey(Buffer.from(config.hmacSecret, 'utf8'));

export function sign(entryCode) {
  return crypto.createHmac('sha256', hmacKey).update(entryCode).digest('hex');
}

export function verify(entryCode, providedSignature) {
  try {
    const expected = sign(entryCode);
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(providedSignature, 'hex'),
    );
  } catch {
    return false;
  }
}

export function buildSignedPayload(entryCode) {
  return `${entryCode}.${sign(entryCode)}`;
}
