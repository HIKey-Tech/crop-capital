import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";

const tenantOptionalApiPaths = new Set([
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/tenants/bootstrap",
]);

export const requireTenant = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (tenantOptionalApiPaths.has(req.path)) {
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
