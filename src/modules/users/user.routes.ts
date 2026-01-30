import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import {
  getUsers,
  getUserStats,
  promoteUser,
  demoteUser,
} from "./user.controller";

const router = Router();

// Admin: get all users (investors)
router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/stats", protect, restrictTo("admin"), getUserStats);

// Admin: promote/demote users
router.patch("/:id/promote", protect, restrictTo("admin"), promoteUser);
router.patch("/:id/demote", protect, restrictTo("admin"), demoteUser);

export default router;
