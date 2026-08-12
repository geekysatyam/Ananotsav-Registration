import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRegistrationById } from '../controllers/lookup.controller.js';

const router = Router();

router.get('/:id', asyncHandler(getRegistrationById));

export default router;
