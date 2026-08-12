import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.middleware.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.middleware.js';
import { adminAuth } from '../middleware/adminAuth.middleware.js';
import { adminLoginSchema } from '../validators/scanner.schema.js';
import { registrationSchema } from '../validators/registration.schema.js';
import { adminListQuerySchema } from '../validators/admin.schema.js';
import {
  adminLogin,
  listRegistrations,
  exportRegistrations,
  deskRegister,
} from '../controllers/admin.controller.js';

const router = Router();

router.post('/login', adminLoginLimiter, validate(adminLoginSchema), asyncHandler(adminLogin));

router.get(
  '/registrations',
  adminAuth,
  validate(adminListQuerySchema, 'query'),
  asyncHandler(listRegistrations),
);

router.get(
  '/registrations/export',
  adminAuth,
  validate(adminListQuerySchema, 'query'),
  asyncHandler(exportRegistrations),
);

router.post(
  '/register',
  adminAuth,
  validate(registrationSchema),
  asyncHandler(deskRegister),
);

export default router;
