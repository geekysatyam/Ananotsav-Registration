import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.middleware.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.middleware.js';
import { adminAuth } from '../middleware/adminAuth.middleware.js';
import { adminLoginSchema } from '../validators/scanner.schema.js';
import { registrationSchema } from '../validators/registration.schema.js';
import { adminListQuerySchema, adminOptInQuerySchema } from '../validators/admin.schema.js';
import {
  adminLogin,
  listRegistrations,
  exportRegistrations,
  deskRegister,
  listVolunteers,
  exportVolunteers,
  listAbhishek,
  exportAbhishek,
  listLadduGopal,
  exportLadduGopal,
  listFancyDress,
  exportFancyDress,
  adminLeaderboard,
  exportAdminLeaderboard,
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

router.get(
  '/volunteers',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listVolunteers),
);
router.get(
  '/volunteers/export',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportVolunteers),
);

router.get(
  '/abhishek',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listAbhishek),
);
router.get(
  '/abhishek/export',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportAbhishek),
);

router.get(
  '/laddu-gopal',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listLadduGopal),
);
router.get(
  '/laddu-gopal/export',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportLadduGopal),
);

router.get(
  '/fancy-dress',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listFancyDress),
);
router.get(
  '/fancy-dress/export',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportFancyDress),
);

router.get(
  '/leaderboard',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(adminLeaderboard),
);
router.get(
  '/leaderboard/export',
  adminAuth,
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportAdminLeaderboard),
);

router.post(
  '/register',
  adminAuth,
  validate(registrationSchema),
  asyncHandler(deskRegister),
);

export default router;
