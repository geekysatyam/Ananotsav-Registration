import { Router } from 'express';

const router = Router();

// GET /api/registration/:id removed — unauthenticated IDOR returned signed QR payloads.
// Use POST /api/find-registration (phone + DOB) or the response from POST /api/register.

export default router;
