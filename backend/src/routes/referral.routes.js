import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateReferralLimiter } from '../middleware/rateLimiter.middleware.js';
import { validateReferral } from '../controllers/referral.controller.js';

const router = Router();

router.get('/:code', validateReferralLimiter, asyncHandler(validateReferral));

export default router;
