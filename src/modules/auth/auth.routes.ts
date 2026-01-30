import { Router } from "express";
import {
  signup,
  login,
  requestPasswordReset,
  resetPasswordHandler,
} from "./auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordHandler);

export default router;
