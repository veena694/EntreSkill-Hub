import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { CustomError } from './error.middleware';
import { UserRole } from '../constants';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new CustomError(401, 'Unauthorized'));
      return;
    }

    const hasRole = allowedRoles.includes(req.user.role as UserRole);
    if (!hasRole) {
      next(new CustomError(403, 'Forbidden: insufficient permissions'));
      return;
    }

    next();
  };
};
export default authorize;
