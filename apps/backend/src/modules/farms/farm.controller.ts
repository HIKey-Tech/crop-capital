import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { Farm } from "./farm.model";
import { uploadImageBuffer, deleteImage } from "@/utils/cloudinary";
import { logActivity } from "@/modules/activities/activity.service";

const asNonEmptyString = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const asOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const asRequiredNumber = (value: unknown, fieldName: string): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new AppError(`${fieldName} must be a valid number`, 400);
  }

  return parsed;
};

const asOptionalCoordinate = (
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
): number | undefined => {
  const normalized = asOptionalString(value);
  if (normalized == null) return undefined;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new AppError(
      `${fieldName} must be a valid number between ${min} and ${max}`,
      400,
    );
  }

  return parsed;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  return [];
};

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (Array.isArray(req.files)) {
    return req.files;
  }

  return [];
};

const parseFarmPayload = (
  body: Record<string, unknown>,
): {
  name: string;
  location: string;
  currency: string;
  coordinates?: { latitude: number; longitude: number };
  investmentGoal: number;
  minimumInvestment: number;
  roi: number;
  durationMonths: number;
} => {
  const latitude = asOptionalCoordinate(body.latitude, "Latitude", -90, 90);
  const longitude = asOptionalCoordinate(
    body.longitude,
    "Longitude",
    -180,
    180,
  );

  return {
    name: asNonEmptyString(body.name, "Name"),
    location: asNonEmptyString(body.location, "Location"),
    currency: asNonEmptyString(body.currency, "Currency"),
    investmentGoal: asRequiredNumber(body.investmentGoal, "Investment goal"),
    minimumInvestment: asRequiredNumber(
      body.minimumInvestment,
      "Minimum investment",
    ),
    roi: asRequiredNumber(body.roi, "ROI"),
    durationMonths: asRequiredNumber(body.durationMonths, "Duration months"),
    ...(latitude != null && longitude != null
      ? { coordinates: { latitude, longitude } }
      : {}),
  };
};

// Admin: create farm
export const createFarm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const imageFiles = getUploadedFiles(req);
    const farmData = parseFarmPayload(req.body as Record<string, unknown>);

    if (!imageFiles.length) {
      return next(new AppError("At least one farm image is required", 400));
    }

    // Upload all images to Cloudinary
    const uploadResults = await Promise.all(
      imageFiles.map((file) => uploadImageBuffer(file.buffer, "farms")),
    );

    const farm = await Farm.create({
      ...(tenantId ? { tenantId } : {}),
      ...farmData,
      images: uploadResults.map((r) => r.url),
      imagePublicIds: uploadResults.map((r) => r.publicId),
    });

    logActivity({
      type: "farm_created",
      title: "New Opportunity",
      description: `${farm.name} was created`,
      actor: req.user?._id,
      resourceId: farm._id,
      resourceType: "Farm",
      metadata: { farmName: farm.name, investmentGoal: farm.investmentGoal },
      tenantId: tenantId?.toString(),
    });

    res.status(201).json({ success: true, farm });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Admin: update farm
export const updateFarm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const farmData = parseFarmPayload(req.body as Record<string, unknown>);
    const imageFiles = getUploadedFiles(req);
    const hasImageChanges = req.body.hasImageChanges === "true";
    const retainedImagePublicIds = toStringArray(
      req.body.retainedImagePublicIds,
    );

    const farm = await Farm.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!farm) return next(new AppError("Farm not found", 404));

    // Handle images update
    if (hasImageChanges) {
      const existingImagesByPublicId = new Map(
        farm.imagePublicIds.map((publicId: string, index: number) => [
          publicId,
          {
            publicId,
            url: farm.images[index],
          },
        ]),
      );

      const retainedImages = retainedImagePublicIds.map((publicId) => {
        const existingImage = existingImagesByPublicId.get(publicId);

        if (!existingImage) {
          throw new AppError(
            "One or more retained farm images are invalid",
            400,
          );
        }

        return existingImage;
      });

      const removedImagePublicIds = farm.imagePublicIds.filter(
        (publicId: string) => !retainedImagePublicIds.includes(publicId),
      );

      if (removedImagePublicIds.length) {
        await Promise.all(removedImagePublicIds.map((pid) => deleteImage(pid)));
      }

      const uploadedImages = await Promise.all(
        imageFiles.map((file) => uploadImageBuffer(file.buffer, "farms")),
      );

      const nextImages = [
        ...retainedImages.map((image) => image.url),
        ...uploadedImages.map((image) => image.url),
      ];
      const nextImagePublicIds = [
        ...retainedImages.map((image) => image.publicId),
        ...uploadedImages.map((image) => image.publicId),
      ];

      if (!nextImages.length) {
        return next(new AppError("At least one farm image is required", 400));
      }

      Object.assign(farmData, {
        images: nextImages,
        imagePublicIds: nextImagePublicIds,
      });
    }

    const updatedFarm = await Farm.findOneAndUpdate(
      { _id: req.params.id, ...(tenantId ? { tenantId } : {}) },
      farmData,
      {
        new: true,
      },
    );

    logActivity({
      type: "farm_updated",
      title: "Opportunity Updated",
      description: `${updatedFarm?.name ?? farm.name} was updated`,
      actor: req.user?._id,
      resourceId: farm._id,
      resourceType: "Farm",
      tenantId: tenantId?.toString(),
    });

    res.json({ success: true, farm: updatedFarm });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Admin: delete farm
export const deleteFarm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const farm = await Farm.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!farm) return next(new AppError("Farm not found", 404));

    // Delete all images from Cloudinary
    if (farm.imagePublicIds?.length) {
      await Promise.all(
        farm.imagePublicIds.map((pid: string) => deleteImage(pid)),
      );
    }

    await Farm.findOneAndDelete({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });

    logActivity({
      type: "farm_deleted",
      title: "Opportunity Deleted",
      description: `${farm.name} was deleted`,
      actor: req.user?._id,
      resourceId: farm._id,
      resourceType: "Farm",
      metadata: { farmName: farm.name },
      tenantId: tenantId?.toString(),
    });

    res.json({ success: true, message: "Farm deleted" });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Investor: list all farms
export const getFarms = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const farms = await Farm.find(tenantId ? { tenantId } : {});
    res.json({ success: true, farms });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Investor: get single farm
export const getFarm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const farm = await Farm.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!farm) return next(new AppError("Farm not found", 404));
    res.json({ success: true, farm });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Admin: add farm update
export const addFarmUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const { stage } = req.body;
    const imageFile = req.file;

    if (!stage) {
      return next(new AppError("Update stage is required", 400));
    }

    const farm = await Farm.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!farm) return next(new AppError("Farm not found", 404));

    const updateData: any = {
      stage,
      date: new Date(),
    };

    // If image is provided, upload it to Cloudinary
    if (imageFile) {
      const { url, publicId } = await uploadImageBuffer(
        imageFile.buffer,
        "farm-updates",
      );
      updateData.image = url;
      updateData.imagePublicId = publicId;
    }

    farm.updates.push(updateData);
    await farm.save();

    res.json({ success: true, farm });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};
