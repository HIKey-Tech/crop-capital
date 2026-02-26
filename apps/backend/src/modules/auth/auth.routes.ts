import { Router } from "express";
import {
  signup,
  login,
  requestPasswordReset,
  resetPasswordHandler,
  getMe,
  updateProfile,
  updatePassword,
} from "./auth.controller";
import { protect } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordHandler);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/update-profile", protect, updateProfile);
router.patch("/update-password", protect, updatePassword);

export default router;
