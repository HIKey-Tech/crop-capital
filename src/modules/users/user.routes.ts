import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { restrictTo } from "../../middlewares/role.middleware";
import { getUsers, getUserStats } from "./user.controller";

const router = Router();

// Admin: get all users (investors)
router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/stats", protect, restrictTo("admin"), getUserStats);

export default router;
