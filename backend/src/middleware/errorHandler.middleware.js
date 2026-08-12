import logger from '../utils/logger.js';
import { error } from '../utils/apiResponse.js';

export function errorHandler(err, req, res, next) {
  logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 'DUPLICATE_REGISTRATION') {
    return error(res, err.code, err.message || 'Duplicate user — already registered', 409, {
      data: { duplicates: err.duplicates ?? [] },
    });
  }

  // MongoDB unique index violation (E11000) — catches race-condition duplicates the app check missed
  if (err.code === 11000) {
    return error(res, 'DUPLICATE_REGISTRATION', 'Duplicate user — already registered with this phone and date of birth', 409, {
      data: { duplicates: [] },
    });
  }

  if (err.code && err.statusCode) {
    return error(res, err.code, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    return error(res, 'VALIDATION_ERROR', err.message, 400);
  }

  return error(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
