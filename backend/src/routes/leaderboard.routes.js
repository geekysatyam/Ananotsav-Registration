import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';

const router = Router();

router.get('/', asyncHandler(getLeaderboard));

export default router;
