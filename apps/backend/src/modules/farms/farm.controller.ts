import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { Farm } from "./farm.model";
import { uploadImage, deleteImage } from "@/utils/cloudinary";
import { logActivity } from "@/modules/activities/activity.service";

// Admin: create farm
export const createFarm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const { images, ...farmData } = req.body;

    if (!images?.length) {
      return next(new AppError("At least one farm image is required", 400));
    }

    // Upload all images to Cloudinary
    const uploadResults = await Promise.all(
      images.map((img: string) => uploadImage(img, "farms")),
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
    const { images, ...farmData } = req.body;

    const farm = await Farm.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!farm) return next(new AppError("Farm not found", 404));

    // Handle images update
    if (images?.length) {
      // Delete all old images from Cloudinary
      if (farm.imagePublicIds?.length) {
        await Promise.all(
          farm.imagePublicIds.map((pid: string) => deleteImage(pid)),
        );
      }

      // Upload all new images
      const uploadResults = await Promise.all(
        images.map((img: string) => uploadImage(img, "farms")),
      );

      farmData.images = uploadResults.map((r: { url: string }) => r.url);
      farmData.imagePublicIds = uploadResults.map(
        (r: { publicId: string }) => r.publicId,
      );
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
    const { stage, image } = req.body;

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
    if (image) {
      const { url, publicId } = await uploadImage(image, "farm-updates");
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
