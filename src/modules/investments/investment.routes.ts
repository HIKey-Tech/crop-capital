import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import {
  investInFarm,
  getMyInvestments,
  getAllInvestments,
  getInvestmentById,
  completeInvestment,
  verifyPayment,
} from "./investment.controller";

const router = Router();

// Investor: invest in farm
router.post("/", protect, restrictTo("investor"), investInFarm);
router.get("/me", protect, getMyInvestments); // Allow both admins and investors

// Admin: get all investments
router.get("/", protect, restrictTo("admin"), getAllInvestments);

// Get single investment by ID (investor sees own, admin sees all)
router.get("/:id", protect, getInvestmentById);

// Verify payment after Paystack callback
router.get("/verify/:reference", protect, verifyPayment);

// Admin: mark investment completed
router.post("/:id/complete", protect, restrictTo("admin"), completeInvestment);

export default router;
