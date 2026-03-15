import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as BaseJwtPayload } from "jsonwebtoken";
import { AppError } from "@/utils/AppError";
import { JWT_SECRET } from "@/config/env";

const tenantOptionalApiPaths = new Set([
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/tenants/bootstrap",
]);

interface JwtPayload extends BaseJwtPayload {
  id: string;
  role?: "investor" | "admin" | "super_admin";
  tenantId?: string;
}

const hasSuperAdminToken = (req: Request): boolean => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      return false;
    }

    return (decoded as JwtPayload).role === "super_admin";
  } catch {
    return false;
  }
};

export const requireTenant = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (tenantOptionalApiPaths.has(req.path) || hasSuperAdminToken(req)) {
    return next();
  }

  if (!req.tenant) {
    return next(
      new AppError("Tenant context is required", 400, {
        code: "TENANT_REQUIRED",
      }),
    );
  }

  next();
};
