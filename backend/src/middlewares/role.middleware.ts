import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Permission denied for role '${req.user.role}'. Allowed roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    return next();
  };
};
