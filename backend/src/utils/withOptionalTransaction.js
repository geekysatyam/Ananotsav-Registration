import mongoose from 'mongoose';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export function isTransactionNotSupportedError(err) {
  return err?.code === 20 || err?.codeName === 'IllegalOperation';
}

/**
 * Runs fn(session) inside a transaction when MongoDB supports it.
 * In production, transactions are required — a standalone MongoDB will cause startup to fail.
 * In development, falls back to fn(null) if transactions are unavailable.
 */
export async function withOptionalTransaction(fn) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (isTransactionNotSupportedError(err)) {
      if (config.nodeEnv === 'production') {
        throw new Error(
          'MongoDB transactions are required in production. ' +
          'Ensure your MONGO_URI points to a replica set, not a standalone instance.',
        );
      }
      logger.warn('MongoDB transactions unavailable — running without a transaction (dev only)');
      return fn(null);
    }

    throw err;
  } finally {
    session.endSession();
  }
}

export function sessionOpts(session) {
  return session ? { session } : undefined;
}
