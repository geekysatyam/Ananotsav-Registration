import dotenv from 'dotenv';

dotenv.config();

const required = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'CORS_ORIGIN',
  'HMAC_SECRET',
  'JWT_SECRET',
  'JWT_EXPIRY',
  'EVENT_YEAR',
];

for (const key of required) {
  if (process.env[key] === undefined || process.env[key] === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

function envFlag(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return defaultValue;
  return raw === 'true' || raw === '1';
}

const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI,
  corsOrigins: process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
  hmacSecret: process.env.HMAC_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY,
  eventYear: Number(process.env.EVENT_YEAR),
  trustProxy: process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1',

  /** Public frontend origin (no trailing slash) — used in WhatsApp captions */
  publicAppUrl: (process.env.PUBLIC_APP_URL || '').replace(/\/$/, ''),

  whatsapp: {
    enabled: envFlag('WHATSAPP_ENABLED', false),
    sessionDir: process.env.WHATSAPP_SESSION_DIR || './data/whatsapp-session',
    sendRegistrationConfirmation: envFlag('WHATSAPP_SEND_REGISTRATION_CONFIRMATION', true),
    sendRegistrationQr: envFlag('WHATSAPP_SEND_REGISTRATION_QR', true),
    maxAttempts: Math.max(1, Number(process.env.WHATSAPP_MAX_ATTEMPTS || 3)),
    workerIntervalMs: Math.max(5_000, Number(process.env.WHATSAPP_WORKER_INTERVAL_MS || 15_000)),
    /** Always 1 — never concurrent registration sends */
    maxConcurrentSends: Math.min(
      1,
      Math.max(1, Number(process.env.WHATSAPP_MAX_CONCURRENT_SENDS || 1)),
    ),
    minDelayMs: Math.max(0, Number(process.env.WHATSAPP_MIN_DELAY_MS || 5_000)),
    maxDelayMs: Math.max(
      Math.max(0, Number(process.env.WHATSAPP_MIN_DELAY_MS || 5_000)),
      Number(process.env.WHATSAPP_MAX_DELAY_MS || 12_000),
    ),
    maxConsecutiveFailures: Math.max(1, Number(process.env.WHATSAPP_MAX_CONSECUTIVE_FAILURES || 3)),
    cooldownMs: Math.max(10_000, Number(process.env.WHATSAPP_COOLDOWN_MS || 300_000)),
    eventDate: process.env.WHATSAPP_EVENT_DATE || '6 September 2026',
    eventVenue: process.env.WHATSAPP_EVENT_VENUE || 'Sri Gokul Gaushala, Amritsar',
  },
};

export default config;
