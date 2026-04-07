import { Router } from "express";
import {
  signup,
  login,
  requestPasswordReset,
  resetPasswordHandler,
  activateAdmin,
  getMe,
  updateProfile,
  updatePassword,
} from "./auth.controller";
import { protect } from "@/middlewares/auth.middleware";
import { profilePhotoUpload } from "@/middlewares/upload.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordHandler);
router.post("/activate", activateAdmin);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/update-profile", protect, profilePhotoUpload, updateProfile);
router.patch("/update-password", protect, updatePassword);

export default router;
