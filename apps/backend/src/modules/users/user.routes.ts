import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import { requireTenantFeature } from "@/middlewares/feature.middleware";
import {
  getUsers,
  getUserById,
  getUserStats,
  getMyDashboardStats,
  promoteUser,
  demoteUser,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} from "./user.controller";

const router = Router();

// Investor: dashboard stats
router.get("/dashboard-stats", protect, getMyDashboardStats);

// Admin: get all users (investors)
router.get(
  "/",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminInvestors"),
  getUsers,
);
router.get(
  "/stats",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminInvestors"),
  getUserStats,
);

// Admin: get single user with investments
router.get(
  "/:id",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminInvestors"),
  getUserById,
);

// Admin: promote/demote users
router.patch(
  "/:id/promote",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminInvestors"),
  promoteUser,
);
router.patch(
  "/:id/demote",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminInvestors"),
  demoteUser,
);

// Watchlist routes (investor)
router.get(
  "/watchlist/all",
  protect,
  requireTenantFeature("farms"),
  getWatchlist,
);
router.post(
  "/watchlist",
  protect,
  requireTenantFeature("farms"),
  addToWatchlist,
);
router.delete(
  "/watchlist/:farmId",
  protect,
  requireTenantFeature("farms"),
  removeFromWatchlist,
);

export default router;
