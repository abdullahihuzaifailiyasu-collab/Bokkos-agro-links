import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/crypto.ts';
import { db } from '../db/store.ts';
import { User } from '../../src/types/index.ts';

// Extend Express Request interface to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      tokenPayload?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof req.headers['x-auth-token'] === 'string') {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid authorization token.',
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
    return;
  }

  const user = db.users.get(payload.userId);
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User associated with this token no longer exists.',
    });
    return;
  }

  if (user.status === 'SUSPENDED') {
    res.status(403).json({
      success: false,
      message: 'Your account has been suspended by administration. Please contact support.',
    });
    return;
  }

  // Strip password hash from request user object
  const { passwordHash, ...safeUser } = user;
  req.user = safeUser as User;
  req.tokenPayload = payload;
  next();
}

/**
 * Optional authentication middleware: if token provided, resolves user; if not, continues without error.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof req.headers['x-auth-token'] === 'string') {
    token = req.headers['x-auth-token'];
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = db.users.get(payload.userId);
      if (user && user.status !== 'SUSPENDED') {
        const { passwordHash, ...safeUser } = user;
        req.user = safeUser as User;
        req.tokenPayload = payload;
      }
    }
  }

  next();
}
