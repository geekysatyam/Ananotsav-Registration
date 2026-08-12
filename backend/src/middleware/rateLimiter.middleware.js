import rateLimit from 'express-rate-limit';
import { error } from '../utils/apiResponse.js';

function createLimiter(windowMs, max, name) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      error(res, 'RATE_LIMITED', `Too many ${name} requests. Please try again later.`, 429);
    },
  });
}

export const registerLimiter = createLimiter(60 * 1000, 10, 'registration');
export const validateReferralLimiter = createLimiter(60 * 1000, 30, 'referral validation');
export const findRegistrationLimiter = createLimiter(60 * 1000, 20, 'lookup');
export const adminLoginLimiter = createLimiter(60 * 1000, 5, 'login');
