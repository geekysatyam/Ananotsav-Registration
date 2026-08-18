import mongoose from 'mongoose';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const MAX_TXN_RETRIES = 8;

export function isTransactionNotSupportedError(err) {
  return err?.code === 20 || err?.codeName === 'IllegalOperation';
}

function hasErrorLabel(err, label) {
  if (typeof err?.hasErrorLabel === 'function' && err.hasErrorLabel(label)) return true;
  const labels = err?.errorLabels ?? err?.errorLabelSet;
  if (Array.isArray(labels)) return labels.includes(label);
  if (labels instanceof Set) return labels.has(label);
  return false;
}

/** Snapshot write conflicts on the same counter doc — MongoDB expects a retry. */
export function isTransientTransactionError(err) {
  if (hasErrorLabel(err, 'TransientTransactionError')) return true;
  return err?.code === 112 || err?.codeName === 'WriteConflict';
}

function isUnknownCommitResult(err) {
  return hasErrorLabel(err, 'UnknownTransactionCommitResult');
}

function backoffMs(attempt) {
  return Math.min(400, 25 * 2 ** attempt) + Math.floor(Math.random() * 40);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function commitWithRetry(session) {
  for (let attempt = 0; attempt < MAX_TXN_RETRIES; attempt++) {
    try {
      await session.commitTransaction();
      return;
    } catch (err) {
      if (isUnknownCommitResult(err) && attempt < MAX_TXN_RETRIES - 1) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Runs fn(session) inside a transaction when MongoDB supports it.
 * Retries WriteConflict / TransientTransactionError (common when two
 * registrations increment the same entry-code counter).
 * In production, transactions are required — a standalone MongoDB will cause startup to fail.
 * In development, falls back to fn(null) if transactions are unavailable.
 */
export async function withOptionalTransaction(fn) {
  const session = await mongoose.startSession();

  try {
    for (let attempt = 0; attempt < MAX_TXN_RETRIES; attempt++) {
      try {
        session.startTransaction();
        const result = await fn(session);
        await commitWithRetry(session);
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

        if (isTransientTransactionError(err) && attempt < MAX_TXN_RETRIES - 1) {
          logger.warn(
            { attempt: attempt + 1, code: err.code, codeName: err.codeName },
            'Registration transaction write conflict — retrying',
          );
          await sleep(backoffMs(attempt));
          continue;
        }

        throw err;
      }
    }
  } finally {
    session.endSession();
  }
}

export function sessionOpts(session) {
  return session ? { session } : undefined;
}
