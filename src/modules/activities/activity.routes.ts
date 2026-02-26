import { Router } from "express";
import { getActivities } from "./activity.controller";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import { requireTenantFeature } from "@/middlewares/feature.middleware";

const router = Router();

// Admin-only: get paginated activities
router.get(
  "/",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminReports"),
  getActivities,
);

export default router;
