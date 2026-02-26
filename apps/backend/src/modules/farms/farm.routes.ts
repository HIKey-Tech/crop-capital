import { Router } from "express";
import {
  createFarm,
  updateFarm,
  deleteFarm,
  getFarms,
  getFarm,
  addFarmUpdate,
} from "./farm.controller";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import {
  requireRoleBasedTenantFeature,
  requireTenantFeature,
} from "@/middlewares/feature.middleware";

const router = Router();

// Admin routes
router.post(
  "/",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminFarms"),
  createFarm,
);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminFarms"),
  updateFarm,
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminFarms"),
  deleteFarm,
);
router.post(
  "/:id/updates",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminFarms"),
  addFarmUpdate,
);

// Investor routes
router.get(
  "/",
  protect,
  restrictTo("investor", "admin"),
  requireRoleBasedTenantFeature({ investor: "farms", admin: "adminFarms" }),
  getFarms,
);
router.get(
  "/:id",
  protect,
  restrictTo("investor", "admin"),
  requireRoleBasedTenantFeature({ investor: "farms", admin: "adminFarms" }),
  getFarm,
);

export default router;
