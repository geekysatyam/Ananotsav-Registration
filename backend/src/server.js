import app from './app.js';
import config from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';
import { initializeWhatsApp, shutdownWhatsApp } from './services/whatsapp/index.js';

let httpServer = null;

async function start() {
  await connectDB();

  // WhatsApp is optional — never block server boot on Baileys
  initializeWhatsApp().catch((err) => {
    logger.error({ err: err?.message }, 'WhatsApp init error (ignored)');
  });

  httpServer = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });
}

async function gracefulShutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  try {
    await shutdownWhatsApp();
  } catch (err) {
    logger.warn({ err: err?.message }, 'WhatsApp shutdown error');
  }
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  process.exit(0);
}

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

start().catch((err) => {
  logger.error(err?.message ?? err);
  process.exit(1);
});
