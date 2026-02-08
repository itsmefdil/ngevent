import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { profiles } from '../db/schema';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, req.user.id))
        .limit(1);

      if (!profile) {
        throw new AppError('User profile not found', 404);
      }

      const userRole = profile.role;

      if (!roles.includes(userRole)) {
        throw new AppError('Forbidden: Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
