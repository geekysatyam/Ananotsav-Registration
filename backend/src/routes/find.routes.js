import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.middleware.js';
import { findRegistrationLimiter } from '../middleware/rateLimiter.middleware.js';
import { lookupSchema } from '../validators/lookup.schema.js';
import { findRegistration } from '../controllers/lookup.controller.js';

const router = Router();

router.post('/', findRegistrationLimiter, validate(lookupSchema), asyncHandler(findRegistration));

export default router;
