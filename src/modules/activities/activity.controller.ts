import { Request, Response, NextFunction } from "express";
import { Activity } from "./activity.model";
import { AppError } from "@/utils/AppError";

// Admin: get activities with pagination and optional type filter
export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string) || 10),
    );
    const type = req.query.type as string | undefined;

    const filter: Record<string, unknown> = {};
    if (type) {
      filter.type = type;
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("actor", "name email photo")
        .lean(),
      Activity.countDocuments(filter),
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};
