import { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { ITenantFeatures } from "@/modules/tenants/tenant.model";

type TenantFeatureKey = keyof ITenantFeatures;

const isFeatureEnabled = (req: Request, feature: TenantFeatureKey): boolean => {
  return Boolean(req.tenant?.features?.[feature]);
};

const featureDisabledError = (
  feature: TenantFeatureKey,
  role?: string,
): AppError => {
  return new AppError(`Feature '${feature}' is disabled for this tenant`, 403, {
    code: "TENANT_FEATURE_DISABLED",
    details: {
      feature,
      ...(role ? { role } : {}),
    },
  });
};

const featureRequirementError = (features: TenantFeatureKey[]): AppError => {
  return new AppError(
    `None of the required features are enabled: ${features.join(", ")}`,
    403,
    {
      code: "TENANT_FEATURE_DISABLED",
      details: {
        requiredFeatures: features,
      },
    },
  );
};

export const requireTenantFeature = (feature: TenantFeatureKey) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (isFeatureEnabled(req, feature)) {
      return next();
    }

    return next(featureDisabledError(feature, req.user?.role));
  };
};

export const requireAnyTenantFeature = (features: TenantFeatureKey[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (features.some((feature) => isFeatureEnabled(req, feature))) {
      return next();
    }

    return next(featureRequirementError(features));
  };
};

export const requireRoleBasedTenantFeature = (options: {
  investor?: TenantFeatureKey;
  admin?: TenantFeatureKey;
  fallback?: TenantFeatureKey;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (role === "admin" || role === "super_admin") {
      if (!options.admin) return next();

      if (isFeatureEnabled(req, options.admin)) {
        return next();
      }

      return next(featureDisabledError(options.admin, role));
    }

    if (role === "investor") {
      if (!options.investor) return next();

      if (isFeatureEnabled(req, options.investor)) {
        return next();
      }

      return next(featureDisabledError(options.investor, role));
    }

    if (!options.fallback) {
      return next();
    }

    if (isFeatureEnabled(req, options.fallback)) {
      return next();
    }

    return next(featureDisabledError(options.fallback, role));
  };
};
