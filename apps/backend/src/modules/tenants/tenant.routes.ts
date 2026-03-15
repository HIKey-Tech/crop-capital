import { Router } from "express";
import {
  assignUnassignedUsers,
  assignUsersToTenant,
  createTenant,
  deleteTenant,
  getTenantBootstrap,
  listTenants,
  updateTenant,
} from "./tenant.controller";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";

const router = Router();

router.get("/bootstrap", getTenantBootstrap);
router.get("/", protect, restrictTo("super_admin"), listTenants);
router.post("/", protect, restrictTo("super_admin"), createTenant);
router.patch("/:id", protect, restrictTo("super_admin"), updateTenant);
router.delete("/:id", protect, restrictTo("super_admin"), deleteTenant);
router.post(
  "/:id/assign-unassigned-users",
  protect,
  restrictTo("super_admin"),
  assignUnassignedUsers,
);
router.post(
  "/:id/assign-users",
  protect,
  restrictTo("super_admin"),
  assignUsersToTenant,
);

export default router;
