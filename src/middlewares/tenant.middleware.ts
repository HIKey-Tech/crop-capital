import { Request, Response, NextFunction } from "express";
import { Tenant } from "@/modules/tenants/tenant.model";
import {
  DEFAULT_TENANT_SLUG,
  NODE_ENV,
  PLATFORM_ROOT_DOMAIN,
  TENANT_CACHE_TTL_SECONDS,
  TENANT_HEADER_SECRET,
  TENANCY_STRICT_MODE,
} from "@/config/env";
import { AppError } from "@/utils/AppError";
import { ITenant } from "@/modules/tenants/tenant.model";

const cleanHost = (value?: string): string => {
  if (!value) return "";
  return value.trim().toLowerCase().split(":")[0];
};

const normalizeSlug = (value?: string): string | null => {
  if (!value) return null;
  const slug = value.trim().toLowerCase();
  if (!slug) return null;
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return slug;
};

const isRootOrSubdomain = (host: string, rootDomain: string): boolean => {
  return host === rootDomain || host.endsWith(`.${rootDomain}`);
};

const isTenantOptionalPath = (path: string): boolean => {
  return path === "/" || path.startsWith("/api/webhooks/");
};

const isTrustedHeaderRequest = (req: Request): boolean => {
  const sharedSecret = req.headers["x-tenant-secret"];
  if (TENANT_HEADER_SECRET && sharedSecret === TENANT_HEADER_SECRET) {
    return true;
  }

  return NODE_ENV !== "production";
};

type CacheEntry = {
  expiresAt: number;
  tenant: ITenant | null;
};

const tenantCache = new Map<string, CacheEntry>();

const getCachedTenant = (key: string): ITenant | null | undefined => {
  const entry = tenantCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    tenantCache.delete(key);
    return undefined;
  }
  return entry.tenant;
};

const setCachedTenant = (key: string, tenant: ITenant | null) => {
  const ttl = Math.max(1, TENANT_CACHE_TTL_SECONDS);
  tenantCache.set(key, {
    tenant,
    expiresAt: Date.now() + ttl * 1000,
  });
};

const resolveSlugFromSubdomain = (host: string): string | null => {
  if (!host || !PLATFORM_ROOT_DOMAIN) return null;

  const normalizedRoot = PLATFORM_ROOT_DOMAIN.toLowerCase().trim();
  if (!isRootOrSubdomain(host, normalizedRoot)) return null;
  if (host === normalizedRoot) return null;

  const suffix = `.${normalizedRoot}`;
  if (!host.endsWith(suffix)) return null;

  const prefix = host.slice(0, -suffix.length);
  if (!prefix) return null;

  const subParts = prefix.split(".").filter(Boolean);
  return normalizeSlug(
    subParts.length ? subParts[subParts.length - 1] : undefined,
  );
};

export const resolveTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (isTenantOptionalPath(req.path)) {
      return next();
    }

    const host = cleanHost(req.headers.host);
    const headerSlugRaw =
      typeof req.headers["x-tenant-slug"] === "string"
        ? req.headers["x-tenant-slug"]
        : undefined;
    const headerSlug = isTrustedHeaderRequest(req)
      ? normalizeSlug(headerSlugRaw)
      : null;

    const hostBasedSlug = resolveSlugFromSubdomain(host);
    const fallbackSlug = NODE_ENV !== "production" ? DEFAULT_TENANT_SLUG : null;

    const slugCandidate =
      headerSlug || hostBasedSlug || normalizeSlug(fallbackSlug ?? undefined);

    const cacheKey = `${host || "no-host"}|${slugCandidate || "no-slug"}`;
    const cached = getCachedTenant(cacheKey);
    if (cached !== undefined) {
      if (cached) {
        req.tenant = cached;
        return next();
      }

      if (TENANCY_STRICT_MODE) {
        return next(
          new AppError("Unable to resolve tenant", 400, {
            code: "TENANT_UNRESOLVED",
            details: {
              host,
              slugCandidate,
            },
          }),
        );
      }
      return next();
    }

    let tenant = null;

    if (slugCandidate) {
      tenant = await Tenant.findOne({ slug: slugCandidate, isActive: true });
    }

    if (!tenant && host) {
      tenant = await Tenant.findOne({
        domains: cleanHost(host),
        isActive: true,
      });
    }

    setCachedTenant(cacheKey, tenant);

    if (!tenant) {
      if (TENANCY_STRICT_MODE) {
        return next(
          new AppError("Unable to resolve tenant", 400, {
            code: "TENANT_UNRESOLVED",
            details: {
              host,
              slugCandidate,
            },
          }),
        );
      }
      return next();
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};
