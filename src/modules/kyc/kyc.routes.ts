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

const router = Router();

// Investor routes
router.post("/submit", protect, restrictTo("investor"), submitKyc);
router.get("/me", protect, restrictTo("investor"), getMyKyc);
router.put("/resubmit", protect, restrictTo("investor"), resubmitKyc);

// Admin routes
router.get("/", protect, restrictTo("admin"), getAllKyc);
router.get("/:id", protect, restrictTo("admin"), getKycById);
router.patch("/:id/approve", protect, restrictTo("admin"), approveKyc);
router.patch("/:id/reject", protect, restrictTo("admin"), rejectKyc);

export default router;
