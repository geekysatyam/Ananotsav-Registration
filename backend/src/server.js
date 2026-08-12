import app from './app.js';
import config from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

async function start() {
  await connectDB();
  app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });
}

start().catch((err) => {
  logger.error(err?.message ?? err);
  process.exit(1);
});
