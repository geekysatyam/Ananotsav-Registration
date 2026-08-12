import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.middleware.js';
import { adminAuth } from '../middleware/adminAuth.middleware.js';
import { checkinSchema, checkinOverrideSchema } from '../validators/scanner.schema.js';
import { scanCheckin, scanCheckinOverride } from '../controllers/scanner.controller.js';

const router = Router();

router.post('/checkin', adminAuth, validate(checkinSchema), asyncHandler(scanCheckin));
router.post('/checkin/override', adminAuth, validate(checkinOverrideSchema), asyncHandler(scanCheckinOverride));

export default router;
