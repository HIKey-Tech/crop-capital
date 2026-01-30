import { Request, Response, NextFunction } from "express";
import {
  signupUser,
  loginUser,
  createToken,
  createRefreshToken,
  forgotPassword,
  resetPassword,
} from "./auth.service";
import { AppError } from "@/utils/AppError";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const user = await signupUser(name, email, password);
    const token = createToken(user.id, user.role);
    const refreshToken = createRefreshToken(user.id);
    res.status(201).json({ success: true, token, refreshToken, user });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    const token = createToken(user.id, user.role);
    const refreshToken = createRefreshToken(user.id);
    res.status(200).json({ success: true, token, refreshToken, user });
  } catch (err: any) {
    next(new AppError(err.message, 401));
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    next(new AppError(err.message, 404));
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, password } = req.body;
    const result = await resetPassword(token, password);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};
