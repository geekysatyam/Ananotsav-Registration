import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import Admin from '../models/Admin.model.js';
import { hasPageAccess, pagesForRole } from '../constants/adminPages.js';
import { error } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function adminAuthHandler(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
  }

  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
  }

  if (!payload?.sub) {
    return error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
  }

  const admin = await Admin.findById(payload.sub).lean();
  if (!admin || !admin.isActive) {
    return error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
  }
  if (typeof payload.tokenVersion === 'number' && payload.tokenVersion !== admin.tokenVersion) {
    return error(res, 'UNAUTHORIZED', 'Session expired. Please sign in again.', 401);
  }

  const pages = pagesForRole(admin.role, admin.pages);
  req.admin = {
    id: admin._id.toString(),
    username: admin.username,
    role: admin.role,
    pages,
  };
  next();
}

/**
 * Verifies Bearer JWT, loads Admin, checks isActive + tokenVersion.
 * Attaches req.admin = { id, username, role, pages }.
 */
export const adminAuth = asyncHandler(adminAuthHandler);

/** Require a specific admin panel page (or super_admin via pagesForRole). */
export function requirePage(page) {
  return (req, res, next) => {
    if (!req.admin) {
      return error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }
    if (!hasPageAccess(req.admin.role, req.admin.pages, page)) {
      return error(res, 'FORBIDDEN', 'You do not have access to this resource', 403);
    }
    next();
  };
}

export function requireSuperAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return error(res, 'FORBIDDEN', 'Super admin access required', 403);
  }
  next();
}
