import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { CustomError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  try {
    let token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;

    if (!token) {
      throw new CustomError(401, 'Access denied. No token provided.');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new CustomError(401, 'Invalid or expired access token'));
    }
  }
};
export default authenticate;
