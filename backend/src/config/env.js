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
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'EVENT_YEAR',
];

for (const key of required) {
  if (process.env[key] === undefined || process.env[key] === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI,
  corsOrigins: process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
  hmacSecret: process.env.HMAC_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  eventYear: Number(process.env.EVENT_YEAR),
};

export default config;
