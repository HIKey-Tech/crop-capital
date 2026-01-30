import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { Farm } from "./farm.model";
import { uploadImage, deleteImage } from "@/utils/cloudinary";

// Admin: create farm
export const createFarm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { image, ...farmData } = req.body;

    // Validate image is provided
    if (!image) {
      return next(new AppError("Farm image is required", 400));
    }

    // Upload image to Cloudinary
    const { url, publicId } = await uploadImage(image, "farms");

    // Create farm with image URL and publicId
    const farm = await Farm.create({
      ...farmData,
      image: url,
      imagePublicId: publicId,
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
    const { image, ...farmData } = req.body;

    const farm = await Farm.findById(req.params.id);
    if (!farm) return next(new AppError("Farm not found", 404));

    // If a new image is provided, upload it and delete the old one
    if (image && image !== farm.image) {
      // Delete old image from Cloudinary
      if (farm.imagePublicId) {
        await deleteImage(farm.imagePublicId);
      }

      // Upload new image
      const { url, publicId } = await uploadImage(image, "farms");
      farmData.image = url;
      farmData.imagePublicId = publicId;
    }

    const updatedFarm = await Farm.findByIdAndUpdate(req.params.id, farmData, {
      new: true,
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
    const farm = await Farm.findById(req.params.id);
    if (!farm) return next(new AppError("Farm not found", 404));

    // Delete image from Cloudinary
    if (farm.imagePublicId) {
      await deleteImage(farm.imagePublicId);
    }

    await Farm.findByIdAndDelete(req.params.id);
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
    const farms = await Farm.find();
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
    const farm = await Farm.findById(req.params.id);
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
    const { stage, image } = req.body;

    if (!stage) {
      return next(new AppError("Update stage is required", 400));
    }

    const farm = await Farm.findById(req.params.id);
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
