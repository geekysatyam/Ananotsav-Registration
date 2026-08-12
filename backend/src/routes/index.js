import { Router } from 'express';
import registrationRoutes from './registration.routes.js';
import referralRoutes from './referral.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';
import lookupRoutes from './lookup.routes.js';
import findRoutes from './find.routes.js';
import scannerRoutes from './scanner.routes.js';
import adminRoutes from './admin.routes.js';
import statsRoutes from './stats.routes.js';

const router = Router();

router.use('/register', registrationRoutes);
router.use('/validate-referral', referralRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/registration', lookupRoutes);
router.use('/find-registration', findRoutes);
router.use('/scan', scannerRoutes);
router.use('/admin', adminRoutes);
router.use('/stats', statsRoutes);

export default router;
