import { Router } from "express";
import { getActivities } from "./activity.controller";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";

const router = Router();

// Admin-only: get paginated activities
router.get("/", protect, restrictTo("admin"), getActivities);

export default router;
