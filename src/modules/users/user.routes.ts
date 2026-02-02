import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
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
router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/stats", protect, restrictTo("admin"), getUserStats);

// Admin: get single user with investments
router.get("/:id", protect, restrictTo("admin"), getUserById);

// Admin: promote/demote users
router.patch("/:id/promote", protect, restrictTo("admin"), promoteUser);
router.patch("/:id/demote", protect, restrictTo("admin"), demoteUser);

// Watchlist routes (investor)
router.get("/watchlist/all", protect, getWatchlist);
router.post("/watchlist", protect, addToWatchlist);
router.delete("/watchlist/:farmId", protect, removeFromWatchlist);

export default router;
