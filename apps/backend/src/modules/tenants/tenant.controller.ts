import { Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { Tenant } from "./tenant.model";
import { User } from "@/modules/users/user.model";

const serializeTenant = (tenant: any) => ({
  id: tenant._id,
  name: tenant.name,
  slug: tenant.slug,
  domains: tenant.domains,
  isActive: tenant.isActive,
  features: tenant.features,
  branding: tenant.branding,
  createdAt: tenant.createdAt,
  updatedAt: tenant.updatedAt,
});

const normalizeDomains = (domains?: string[]) => {
  return (domains || [])
    .map((domain) => domain.toLowerCase().trim().split(":")[0])
    .filter(Boolean);
};

export const getTenantBootstrap = async (req: Request, res: Response) => {
  const tenant = req.tenant;

  if (!tenant) {
    return res.status(200).json({
      success: true,
      tenant: null,
    });
  }

  res.status(200).json({
    success: true,
    tenant: {
      id: tenant._id,
      name: tenant.name,
      slug: tenant.slug,
      features: tenant.features,
      branding: tenant.branding,
    },
  });
};

export const listTenants = async (_req: Request, res: Response) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tenants.length,
    tenants: tenants.map(serializeTenant),
  });
};

export const createTenant = async (req: Request, res: Response) => {
  const { name, slug, domains, isActive, branding, features } = req.body;

  if (!name || !slug || !branding?.displayName) {
    throw new AppError("name, slug and branding.displayName are required", 400);
  }

  const tenant = await Tenant.create({
    name,
    slug,
    domains: normalizeDomains(domains),
    isActive: isActive !== false,
    branding,
    ...(features !== undefined ? { features } : {}),
  });

  res.status(201).json({ success: true, tenant: serializeTenant(tenant) });
};

export const updateTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, domains, isActive, branding, features } = req.body;

  const tenant = await Tenant.findByIdAndUpdate(
    id,
    {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(domains !== undefined ? { domains: normalizeDomains(domains) } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(branding !== undefined ? { branding } : {}),
      ...(features !== undefined ? { features } : {}),
    },
    { new: true, runValidators: true },
  );

  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  res.status(200).json({ success: true, tenant: serializeTenant(tenant) });
};

export const assignUnassignedUsers = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tenant = await Tenant.findById(id);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  const result = await User.updateMany(
    {
      $or: [{ tenantId: { $exists: false } }, { tenantId: null }],
    },
    { $set: { tenantId: tenant._id } },
  );

  res.status(200).json({
    success: true,
    message: "Unassigned users moved to tenant",
    updatedCount: result.modifiedCount,
  });
};

export const assignUsersToTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userIds } = req.body as { userIds?: string[] };

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError("userIds must be a non-empty array", 400);
  }

  const tenant = await Tenant.findById(id);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: { tenantId: tenant._id } },
  );

  res.status(200).json({
    success: true,
    message: "Selected users assigned to tenant",
    updatedCount: result.modifiedCount,
  });
};
