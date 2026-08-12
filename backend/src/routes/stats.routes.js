import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRegistrantCount } from '../controllers/stats.controller.js';

const router = Router();

router.get('/count', asyncHandler(getRegistrantCount));

export default router;
