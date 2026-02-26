import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";

export const requireTenant = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.tenant) {
    return next(
      new AppError("Tenant context is required", 400, {
        code: "TENANT_REQUIRED",
      }),
    );
  }

  next();
};
