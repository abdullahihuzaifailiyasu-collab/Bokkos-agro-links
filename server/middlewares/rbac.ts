import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../src/types/index.ts';

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication is required before accessing this resource.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: [${roles.join(', ')}]. Your current role is [${req.user.role}].`,
      });
      return;
    }

    next();
  };
}
