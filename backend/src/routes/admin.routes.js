import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.middleware.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.middleware.js';
import { adminAuth, requirePage, requireSuperAdmin } from '../middleware/adminAuth.middleware.js';
import { adminLoginSchema, createAdminSchema, updateAdminSchema } from '../validators/adminUser.schema.js';
import { registrationSchema } from '../validators/registration.schema.js';
import { adminListQuerySchema, adminOptInQuerySchema } from '../validators/admin.schema.js';
import {
  adminLogin,
  adminMe,
  listAdmins,
  createAdmin,
  updateAdmin,
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
  // REFERRAL DISABLED
  // adminLeaderboard,
  // exportAdminLeaderboard,
} from '../controllers/admin.controller.js';

const router = Router();

router.post('/login', adminLoginLimiter, validate(adminLoginSchema), asyncHandler(adminLogin));

router.get('/me', adminAuth, asyncHandler(adminMe));

router.get('/users', adminAuth, requireSuperAdmin, asyncHandler(listAdmins));
router.post(
  '/users',
  adminAuth,
  requireSuperAdmin,
  validate(createAdminSchema),
  asyncHandler(createAdmin),
);
router.patch(
  '/users/:id',
  adminAuth,
  requireSuperAdmin,
  validate(updateAdminSchema),
  asyncHandler(updateAdmin),
);

router.get(
  '/registrations',
  adminAuth,
  requirePage('registrations'),
  validate(adminListQuerySchema, 'query'),
  asyncHandler(listRegistrations),
);

router.get(
  '/registrations/export',
  adminAuth,
  requirePage('registrations'),
  validate(adminListQuerySchema, 'query'),
  asyncHandler(exportRegistrations),
);

router.get(
  '/volunteers',
  adminAuth,
  requirePage('volunteers'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listVolunteers),
);
router.get(
  '/volunteers/export',
  adminAuth,
  requirePage('volunteers'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportVolunteers),
);

router.get(
  '/abhishek',
  adminAuth,
  requirePage('abhishek'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listAbhishek),
);
router.get(
  '/abhishek/export',
  adminAuth,
  requirePage('abhishek'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportAbhishek),
);

router.get(
  '/laddu-gopal',
  adminAuth,
  requirePage('laddu-gopal'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listLadduGopal),
);
router.get(
  '/laddu-gopal/export',
  adminAuth,
  requirePage('laddu-gopal'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportLadduGopal),
);

router.get(
  '/fancy-dress',
  adminAuth,
  requirePage('fancy-dress'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(listFancyDress),
);
router.get(
  '/fancy-dress/export',
  adminAuth,
  requirePage('fancy-dress'),
  validate(adminOptInQuerySchema, 'query'),
  asyncHandler(exportFancyDress),
);

// REFERRAL DISABLED
// router.get(
//   '/leaderboard',
//   adminAuth,
//   requirePage('leaderboard'),
//   validate(adminOptInQuerySchema, 'query'),
//   asyncHandler(adminLeaderboard),
// );
// router.get(
//   '/leaderboard/export',
//   adminAuth,
//   requirePage('leaderboard'),
//   validate(adminOptInQuerySchema, 'query'),
//   asyncHandler(exportAdminLeaderboard),
// );

router.post(
  '/register',
  adminAuth,
  requirePage('register'),
  validate(registrationSchema),
  asyncHandler(deskRegister),
);

export default router;
