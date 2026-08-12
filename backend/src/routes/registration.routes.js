import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerLimiter } from '../middleware/rateLimiter.middleware.js';
import { registrationSchema } from '../validators/registration.schema.js';
import { register } from '../controllers/registration.controller.js';

const router = Router();

router.post('/', registerLimiter, validate(registrationSchema), asyncHandler(register));

export default router;
