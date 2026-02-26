import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import {
  requireRoleBasedTenantFeature,
  requireTenantFeature,
} from "@/middlewares/feature.middleware";
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
router.post(
  "/",
  protect,
  restrictTo("investor"),
  requireTenantFeature("investments"),
  investInFarm,
);
router.get(
  "/me",
  protect,
  requireRoleBasedTenantFeature({
    investor: "investments",
    admin: "adminTransactions",
  }),
  getMyInvestments,
); // Allow both admins and investors

// Admin: get all investments
router.get(
  "/",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminTransactions"),
  getAllInvestments,
);

// Get single investment by ID (investor sees own, admin sees all)
router.get(
  "/:id",
  protect,
  requireRoleBasedTenantFeature({
    investor: "investments",
    admin: "adminTransactions",
  }),
  getInvestmentById,
);

// Verify payment after Paystack callback
router.get(
  "/verify/:reference",
  protect,
  requireTenantFeature("transactions"),
  verifyPayment,
);

// Admin: mark investment completed
router.post(
  "/:id/complete",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminTransactions"),
  completeInvestment,
);

export default router;
