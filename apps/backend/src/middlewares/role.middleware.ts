import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return next(
        new AppError("You do not have permission to perform this action", 403, {
          code: "AUTH_FORBIDDEN",
        }),
      );
    }

    if (user.role === "super_admin") {
      return next();
    }

    if (!roles.includes(user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403, {
          code: "AUTH_ROLE_FORBIDDEN",
          details: {
            requiredRoles: roles,
            userRole: user.role,
          },
        }),
      );
    }

    next();
  };
};
