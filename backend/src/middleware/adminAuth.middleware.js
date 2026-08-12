import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { error } from '../utils/apiResponse.js';

export function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
  }

  const token = header.slice(7);
  try {
    jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return error(res, 'UNAUTHORIZED', 'Unauthorized', 401);
  }
}
