import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { Tenant } from "./tenant.model";
import { User } from "@/modules/users/user.model";
import { Farm } from "@/modules/farms/farm.model";
import {
  Commodity,
  CommodityOrder,
} from "@/modules/commodities/commodity.model";
import { Investment } from "@/modules/investments/investment.model";
import { KycDocument } from "@/modules/kyc/kyc.model";
import { Activity } from "@/modules/activities/activity.model";
import { logActivity } from "@/modules/activities/activity.service";
import { WebhookEvent } from "@/modules/payments/webhookEvent.model";
import { deleteImage } from "@/utils/cloudinary";
import { inviteTenantAdmin } from "@/modules/auth/auth.service";
import { clearTenantResolutionCache } from "@/middlewares/tenant.middleware";

const serializeTenant = (tenant: any) => ({
  id: tenant._id,
  name: tenant.name,
  slug: tenant.slug,
  domains: tenant.domains || [],
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

const getChangedKeys = (
  previous: Record<string, unknown> = {},
  next: Record<string, unknown> = {},
) => {
  return Array.from(
    new Set([...Object.keys(previous), ...Object.keys(next)]),
  ).filter(
    (key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key]),
  );
};

const summarizeTenantChanges = (previous: any, next: any) => {
  const changedFields: string[] = [];

  if (previous.name !== next.name) {
    changedFields.push("name");
  }

  if (previous.slug !== next.slug) {
    changedFields.push("slug");
  }

  if (previous.isActive !== next.isActive) {
    changedFields.push("status");
  }

  if (
    JSON.stringify(previous.domains || []) !==
    JSON.stringify(next.domains || [])
  ) {
    changedFields.push("domains");
  }

  const brandingChanges = getChangedKeys(
    previous.branding || {},
    next.branding || {},
  ).map((key) => `branding.${key}`);
  const featureChanges = getChangedKeys(
    previous.features || {},
    next.features || {},
  ).map((key) => `features.${key}`);

  changedFields.push(...brandingChanges, ...featureChanges);

  return {
    changedFields,
    brandingChanges,
    featureChanges,
  };
};

const deleteImagesBestEffort = async (publicIds: string[]) => {
  const settled = await Promise.allSettled(
    publicIds.filter(Boolean).map((publicId) => deleteImage(publicId)),
  );

  return settled.reduce(
    (summary, result) => {
      if (result.status === "fulfilled") {
        summary.deleted += 1;
      } else {
        summary.failed += 1;
      }

      return summary;
    },
    { deleted: 0, failed: 0 },
  );
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

  const enabledFeatures = Object.entries(tenant.features || {})
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => key);

  logActivity({
    type: "tenant_created",
    title: "Tenant created",
    description: `${tenant.name} was created and is ${tenant.isActive ? "active" : "inactive"}.`,
    tenantId: tenant._id,
    actor: req.user?._id,
    resourceId: tenant._id,
    resourceType: "Tenant",
    metadata: {
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      domains: tenant.domains || [],
      enabledFeatures,
    },
  });

  clearTenantResolutionCache();

  res.status(201).json({ success: true, tenant: serializeTenant(tenant) });
};

export const updateTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, domains, isActive, branding, features } = req.body;

  const existingTenant = await Tenant.findById(id);

  if (!existingTenant) {
    throw new AppError("Tenant not found", 404);
  }

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

  const previousTenant = existingTenant.toObject();
  const { changedFields, brandingChanges, featureChanges } =
    summarizeTenantChanges(previousTenant, tenant.toObject());

  if (changedFields.length > 0) {
    logActivity({
      type: "tenant_updated",
      title: "Tenant settings updated",
      description: `${tenant.name} settings updated: ${changedFields.join(", ")}.`,
      tenantId: tenant._id,
      actor: req.user?._id,
      resourceId: tenant._id,
      resourceType: "Tenant",
      metadata: {
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        changedFields,
        brandingChanges,
        featureChanges,
        previousDomains: previousTenant.domains || [],
        nextDomains: tenant.domains || [],
        previousStatus: previousTenant.isActive,
        nextStatus: tenant.isActive,
      },
    });
  }

  clearTenantResolutionCache();

  res.status(200).json({ success: true, tenant: serializeTenant(tenant) });
};

export const deleteTenant = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tenant = await Tenant.findById(id);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  const tenantId = tenant._id;
  const [farms, commodities, kycDocuments, users] = await Promise.all([
    Farm.find({ tenantId }),
    Commodity.find({ tenantId }),
    KycDocument.find({ tenantId }),
    User.find({ tenantId }).select("photoPublicId"),
  ]);

  const farmImagePublicIds = farms.flatMap((farm) => [
    ...(farm.imagePublicIds || []),
    ...farm.updates
      .map((update) => update.imagePublicId)
      .filter((publicId): publicId is string => Boolean(publicId)),
  ]);

  const commodityImagePublicIds = commodities.flatMap(
    (commodity) => commodity.imagePublicIds || [],
  );

  const kycImagePublicIds = kycDocuments
    .flatMap((document) => [
      document.documentImagePublicId,
      document.selfieImagePublicId,
    ])
    .filter((publicId): publicId is string => Boolean(publicId));

  const userPhotoPublicIds = users
    .map((user) => user.photoPublicId)
    .filter((publicId): publicId is string => Boolean(publicId));

  const [
    farmImageCleanup,
    commodityImageCleanup,
    kycImageCleanup,
    userPhotoCleanup,
    commodityOrdersResult,
    commoditiesResult,
    investmentsResult,
    activitiesResult,
    usersResult,
    webhookEventsResult,
    kycResult,
    farmsResult,
    tenantDeleteResult,
  ] = await Promise.all([
    deleteImagesBestEffort(farmImagePublicIds),
    deleteImagesBestEffort(commodityImagePublicIds),
    deleteImagesBestEffort(kycImagePublicIds),
    deleteImagesBestEffort(userPhotoPublicIds),
    CommodityOrder.deleteMany({ tenantId }),
    Commodity.deleteMany({ tenantId }),
    Investment.deleteMany({ tenantId }),
    Activity.deleteMany({ tenantId }),
    User.deleteMany({ tenantId }),
    WebhookEvent.deleteMany({ tenantId: tenantId.toString() }),
    KycDocument.deleteMany({ tenantId }),
    Farm.deleteMany({ tenantId }),
    Tenant.deleteOne({ _id: tenantId }),
  ]);

  if (tenantDeleteResult.deletedCount !== 1) {
    throw new AppError("Failed to delete tenant", 500);
  }

  const cleanup = {
    tenantId: tenantId.toString(),
    tenantSlug: tenant.slug,
    usersDeleted: usersResult.deletedCount ?? 0,
    farmsDeleted: farmsResult.deletedCount ?? 0,
    commoditiesDeleted: commoditiesResult.deletedCount ?? 0,
    commodityOrdersDeleted: commodityOrdersResult.deletedCount ?? 0,
    investmentsDeleted: investmentsResult.deletedCount ?? 0,
    kycDocumentsDeleted: kycResult.deletedCount ?? 0,
    activitiesDeleted: activitiesResult.deletedCount ?? 0,
    webhookEventsDeleted: webhookEventsResult.deletedCount ?? 0,
    farmImagesDeleted: farmImageCleanup.deleted,
    farmImagesFailed: farmImageCleanup.failed,
    commodityImagesDeleted: commodityImageCleanup.deleted,
    commodityImagesFailed: commodityImageCleanup.failed,
    kycImagesDeleted: kycImageCleanup.deleted,
    kycImagesFailed: kycImageCleanup.failed,
    userPhotosDeleted: userPhotoCleanup.deleted,
    userPhotosFailed: userPhotoCleanup.failed,
  };

  logActivity({
    type: "tenant_deleted",
    title: "Tenant deleted",
    description: `${tenant.name} was permanently deleted with tenant-bound cleanup counts recorded.`,
    actor: req.user?._id,
    resourceId: tenantId,
    resourceType: "Tenant",
    metadata: cleanup,
  });

  clearTenantResolutionCache();

  res.status(200).json({
    success: true,
    message: `Tenant '${tenant.slug}' deleted successfully`,
    cleanup,
  });
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

export const inviteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { email } = req.body as { email?: string };

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      throw new AppError("Tenant not found", 404);
    }

    const result = await inviteTenantAdmin(
      email,
      tenant._id.toString(),
      tenant.slug,
    );
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    const message = err?.message || "Failed to send invitation";
    const statusCode =
      message.includes("Email delivery") ||
      message.includes("Email authentication") ||
      message.includes("Unable to connect to the email server") ||
      message.includes("Email service is not configured")
        ? 503
        : 400;

    next(new AppError(message, statusCode));
  }
};
