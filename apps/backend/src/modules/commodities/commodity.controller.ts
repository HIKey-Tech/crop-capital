import { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { uploadImageBuffer, deleteImage } from "@/utils/cloudinary";
import {
  Commodity,
  CommodityOrder,
  CommodityOrderStatus,
} from "./commodity.model";

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

const asBoolean = (value: unknown, defaultValue = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return defaultValue;
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

const parseCommodityPayload = (body: Record<string, unknown>) => {
  const availableQuantity = asRequiredNumber(
    body.availableQuantity,
    "Available quantity",
  );
  const minimumOrderQuantity = asRequiredNumber(
    body.minimumOrderQuantity,
    "Minimum order quantity",
  );

  if (availableQuantity < 0) {
    throw new AppError("Available quantity cannot be negative", 400);
  }

  if (minimumOrderQuantity < 1) {
    throw new AppError("Minimum order quantity must be at least 1", 400);
  }

  if (minimumOrderQuantity > availableQuantity && availableQuantity > 0) {
    throw new AppError(
      "Minimum order quantity cannot exceed available quantity",
      400,
    );
  }

  return {
    name: asNonEmptyString(body.name, "Name"),
    category: asNonEmptyString(body.category, "Category"),
    description: asOptionalString(body.description),
    location: asNonEmptyString(body.location, "Location"),
    currency: asNonEmptyString(body.currency, "Currency"),
    unit: asNonEmptyString(body.unit, "Unit"),
    price: asRequiredNumber(body.price, "Price"),
    availableQuantity,
    minimumOrderQuantity,
    isFeatured: asBoolean(body.isFeatured, false),
    isPublished: asBoolean(body.isPublished, true),
  };
};

type OrderItemInput = {
  listingId: string;
  quantity: number;
};

const parseOrderItems = (value: unknown): OrderItemInput[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(
      "At least one commodity is required to place an order",
      400,
    );
  }

  return value.map((item, index) => {
    if (typeof item !== "object" || item == null) {
      throw new AppError(`Order item ${index + 1} is invalid`, 400);
    }

    const listingId = asNonEmptyString(
      (item as Record<string, unknown>).listingId,
      `Order item ${index + 1} listingId`,
    );
    const quantity = asRequiredNumber(
      (item as Record<string, unknown>).quantity,
      `Order item ${index + 1} quantity`,
    );

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError(
        `Order item ${index + 1} quantity must be a positive integer`,
        400,
      );
    }

    return { listingId, quantity };
  });
};

const restockOrderInventory = async (orderId: string) => {
  const order = await CommodityOrder.findById(orderId);
  if (!order) return null;

  await Promise.all(
    order.items.map((item) =>
      Commodity.findByIdAndUpdate(item.commodity, {
        $inc: {
          availableQuantity: item.quantity,
          soldQuantity: -item.quantity,
        },
      }),
    ),
  );

  return order;
};

const reserveOrderInventory = async (orderId: string) => {
  const order = await CommodityOrder.findById(orderId);
  if (!order) return null;

  for (const item of order.items) {
    const updated = await Commodity.findOneAndUpdate(
      { _id: item.commodity, availableQuantity: { $gte: item.quantity } },
      {
        $inc: {
          availableQuantity: -item.quantity,
          soldQuantity: item.quantity,
        },
      },
      { new: true },
    );

    if (!updated) {
      const commodity = await Commodity.findById(item.commodity);
      if (!commodity)
        throw new AppError("Commodity order item no longer exists", 404);
      throw new AppError(
        `Insufficient stock to restore order for ${commodity.name}`,
        409,
      );
    }
  }

  return order;
};

export const createCommodity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const imageFiles = getUploadedFiles(req);
    const commodityData = parseCommodityPayload(
      req.body as Record<string, unknown>,
    );

    if (!imageFiles.length) {
      return next(
        new AppError("At least one commodity image is required", 400),
      );
    }

    const uploadResults = await Promise.all(
      imageFiles.map((file) => uploadImageBuffer(file.buffer, "commodities")),
    );

    const commodity = await Commodity.create({
      ...(tenantId ? { tenantId } : {}),
      ...(req.user?._id ? { sellerId: req.user._id } : {}),
      ...commodityData,
      images: uploadResults.map((result) => result.url),
      imagePublicIds: uploadResults.map((result) => result.publicId),
    });

    res.status(201).json({ success: true, commodity });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const updateCommodity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const commodityData = parseCommodityPayload(
      req.body as Record<string, unknown>,
    );
    const imageFiles = getUploadedFiles(req);
    const hasImageChanges = req.body.hasImageChanges === "true";
    const retainedImagePublicIds = toStringArray(
      req.body.retainedImagePublicIds,
    );

    const commodity = await Commodity.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });

    if (!commodity) return next(new AppError("Commodity not found", 404));

    if (hasImageChanges) {
      const existingImagesByPublicId = new Map(
        commodity.imagePublicIds.map((publicId: string, index: number) => [
          publicId,
          { publicId, url: commodity.images[index] },
        ]),
      );

      const retainedImages = retainedImagePublicIds.map((publicId) => {
        const existingImage = existingImagesByPublicId.get(publicId);

        if (!existingImage) {
          throw new AppError(
            "One or more retained commodity images are invalid",
            400,
          );
        }

        return existingImage;
      });

      const removedImagePublicIds = commodity.imagePublicIds.filter(
        (publicId: string) => !retainedImagePublicIds.includes(publicId),
      );

      if (removedImagePublicIds.length) {
        await Promise.all(removedImagePublicIds.map((pid) => deleteImage(pid)));
      }

      const uploadedImages = await Promise.all(
        imageFiles.map((file) => uploadImageBuffer(file.buffer, "commodities")),
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
        return next(
          new AppError("At least one commodity image is required", 400),
        );
      }

      Object.assign(commodityData, {
        images: nextImages,
        imagePublicIds: nextImagePublicIds,
      });
    }

    const updatedCommodity = await Commodity.findOneAndUpdate(
      { _id: req.params.id, ...(tenantId ? { tenantId } : {}) },
      commodityData,
      { new: true },
    );

    res.json({ success: true, commodity: updatedCommodity });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const deleteCommodity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const commodity = await Commodity.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });

    if (!commodity) return next(new AppError("Commodity not found", 404));

    if (commodity.imagePublicIds?.length) {
      await Promise.all(
        commodity.imagePublicIds.map((pid) => deleteImage(pid)),
      );
    }

    await Commodity.findOneAndDelete({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });

    res.json({ success: true, message: "Commodity deleted" });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const getCommodities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const isAdmin =
      req.user?.role === "admin" || req.user?.role === "super_admin";
    const commodities = await Commodity.find({
      ...(tenantId ? { tenantId } : {}),
      ...(isAdmin ? {} : { isPublished: true }),
    }).sort({ isFeatured: -1, createdAt: -1 });

    res.json({ success: true, commodities });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const getCommodity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const isAdmin =
      req.user?.role === "admin" || req.user?.role === "super_admin";
    const commodity = await Commodity.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
      ...(isAdmin ? {} : { isPublished: true }),
    });

    if (!commodity) return next(new AppError("Commodity not found", 404));

    res.json({ success: true, commodity });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const createCommodityOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const items = parseOrderItems((req.body as Record<string, unknown>).items);
    const deliveryAddress = asOptionalString(
      (req.body as Record<string, unknown>).deliveryAddress,
    );
    const customerNote = asOptionalString(
      (req.body as Record<string, unknown>).customerNote,
    );
    const contactPhone = asOptionalString(
      (req.body as Record<string, unknown>).contactPhone,
    );

    const commodityIds = items.map((item) => item.listingId);
    const commodities = await Commodity.find({
      _id: { $in: commodityIds },
      ...(tenantId ? { tenantId } : {}),
      isPublished: true,
    });

    if (commodities.length !== items.length) {
      return next(
        new AppError("One or more selected commodities are unavailable", 404),
      );
    }

    const commodityById = new Map(
      commodities.map((commodity) => [commodity._id.toString(), commodity]),
    );

    const [firstCommodity] = commodities;
    const orderItems = items.map((item) => {
      const commodity = commodityById.get(item.listingId);

      if (!commodity) {
        throw new AppError(
          "One or more selected commodities are unavailable",
          404,
        );
      }

      if (commodity.currency !== firstCommodity.currency) {
        throw new AppError(
          "Orders can only contain commodities priced in the same currency",
          400,
        );
      }

      if (item.quantity < commodity.minimumOrderQuantity) {
        throw new AppError(
          `${commodity.name} requires a minimum order of ${commodity.minimumOrderQuantity}`,
          400,
        );
      }

      if (item.quantity > commodity.availableQuantity) {
        throw new AppError(
          `${commodity.name} only has ${commodity.availableQuantity} ${commodity.unit} available`,
          400,
        );
      }

      return {
        commodity,
        quantity: item.quantity,
        lineTotal: commodity.price * item.quantity,
      };
    });

    for (const { commodity, quantity } of orderItems) {
      const updated = await Commodity.findOneAndUpdate(
        { _id: commodity._id, availableQuantity: { $gte: quantity } },
        { $inc: { availableQuantity: -quantity, soldQuantity: quantity } },
        { new: true },
      );

      if (!updated) {
        throw new AppError(
          `${commodity.name} only has ${commodity.availableQuantity} ${commodity.unit} available`,
          409,
        );
      }
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

    const order = await CommodityOrder.create({
      ...(tenantId ? { tenantId } : {}),
      buyer: req.user?._id,
      buyerName: req.user?.name,
      buyerEmail: req.user?.email,
      contactPhone,
      deliveryAddress,
      customerNote,
      currency: firstCommodity.currency,
      subtotal,
      items: orderItems.map(({ commodity, quantity, lineTotal }) => ({
        commodity: commodity._id,
        name: commodity.name,
        unit: commodity.unit,
        image: commodity.images[0],
        quantity,
        unitPrice: commodity.price,
        lineTotal,
      })),
      status: "pending",
    });

    res.status(201).json({ success: true, order });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const listCommodityOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const orders = await CommodityOrder.find(tenantId ? { tenantId } : {})
      .sort({ createdAt: -1 })
      .populate("buyer", "_id name email photo");

    res.json({ success: true, orders });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const listMyCommodityOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const buyerId = req.user?._id;

    if (!buyerId) {
      return next(new AppError("Authenticated user is required", 401));
    }

    const orders = await CommodityOrder.find({
      ...(tenantId ? { tenantId } : {}),
      buyer: buyerId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};

export const updateCommodityOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const status = asNonEmptyString(
      req.body.status,
      "Status",
    ) as CommodityOrderStatus;
    const statusNote = asOptionalString(req.body.statusNote);

    if (!["pending", "confirmed", "fulfilled", "cancelled"].includes(status)) {
      return next(new AppError("Invalid order status", 400));
    }

    const order = await CommodityOrder.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    });

    if (!order) return next(new AppError("Order not found", 404));

    const wasCancelled = order.status === "cancelled";
    const willBeCancelled = status === "cancelled";

    if (!wasCancelled && willBeCancelled) {
      await restockOrderInventory(order._id.toString());
    }

    if (wasCancelled && !willBeCancelled) {
      await reserveOrderInventory(order._id.toString());
    }

    order.status = status;
    order.statusNote = statusNote;
    await order.save();

    res.json({ success: true, order });
  } catch (err: unknown) {
    if (err instanceof AppError) return next(err);
    next(
      new AppError(
        err instanceof Error ? err.message : "Unexpected error",
        500,
      ),
    );
  }
};
