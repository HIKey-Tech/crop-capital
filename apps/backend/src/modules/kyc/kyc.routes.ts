import { Router } from "express";
import {
  submitKyc,
  getMyKyc,
  resubmitKyc,
  getAllKyc,
  getKycById,
  approveKyc,
  rejectKyc,
} from "./kyc.controller";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import { requireTenantFeature } from "@/middlewares/feature.middleware";
import { kycImagesUpload } from "@/middlewares/upload.middleware";

const router = Router();

// Investor routes
router.post(
  "/submit",
  protect,
  restrictTo("investor"),
  kycImagesUpload,
  submitKyc,
);
router.get("/me", protect, restrictTo("investor"), getMyKyc);
router.put(
  "/resubmit",
  protect,
  restrictTo("investor"),
  kycImagesUpload,
  resubmitKyc,
);

// Admin routes
router.get(
  "/",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminKyc"),
  getAllKyc,
);
router.get(
  "/:id",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminKyc"),
  getKycById,
);
router.patch(
  "/:id/approve",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminKyc"),
  approveKyc,
);
router.patch(
  "/:id/reject",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminKyc"),
  rejectKyc,
);

export default router;
