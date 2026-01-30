import { Router } from "express";
import {
  createFarm,
  updateFarm,
  deleteFarm,
  getFarms,
  getFarm,
  addFarmUpdate,
} from "./farm.controller";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";

const router = Router();

// Admin routes
router.post("/", protect, restrictTo("admin"), createFarm);
router.patch("/:id", protect, restrictTo("admin"), updateFarm);
router.delete("/:id", protect, restrictTo("admin"), deleteFarm);
router.post("/:id/updates", protect, restrictTo("admin"), addFarmUpdate);

// Investor routes
router.get("/", protect, restrictTo("investor", "admin"), getFarms);
router.get("/:id", protect, restrictTo("investor", "admin"), getFarm);

export default router;
