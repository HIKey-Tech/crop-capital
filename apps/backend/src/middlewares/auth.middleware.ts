import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { User } from "@/modules/users/user.model";

interface JwtPayload {
  id: string;
  role: "investor" | "admin" | "super_admin";
  tenantId?: string;
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("Not logged in. Token missing.", 401, {
          code: "AUTH_TOKEN_MISSING",
        }),
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Find user in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError("User no longer exists.", 401, {
          code: "AUTH_USER_NOT_FOUND",
          details: { userId: decoded.id },
        }),
      );
    }

    if (decoded.tenantId && user.tenantId?.toString() !== decoded.tenantId) {
      return next(
        new AppError("Invalid tenant token", 401, {
          code: "AUTH_TENANT_TOKEN_MISMATCH",
          details: {
            tokenTenantId: decoded.tenantId,
            userTenantId: user.tenantId?.toString(),
          },
        }),
      );
    }

    if (
      req.tenant &&
      user.tenantId &&
      user.tenantId.toString() !== req.tenant._id.toString()
    ) {
      return next(
        new AppError("Unauthorized tenant access", 403, {
          code: "TENANT_ACCESS_DENIED",
          details: {
            userTenantId: user.tenantId.toString(),
            requestTenantId: req.tenant._id.toString(),
          },
        }),
      );
    }

    // Attach user to request
    (req as any).user = user;

    next();
  } catch (err) {
    return next(
      new AppError("Invalid or expired token", 401, {
        code: "AUTH_TOKEN_INVALID",
      }),
    );
  }
};
