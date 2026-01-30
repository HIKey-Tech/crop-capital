import { Request, Response, NextFunction } from "express";
import {
  signupUser,
  loginUser,
  createToken,
  createRefreshToken,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  updateUserPassword,
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

// Get current authenticated user
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        country: req.user.country,
        photo: req.user.photo,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err: any) {
    next(new AppError(err.message, 401));
  }
};

// Update current user profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const { name, country, photo } = req.body;
    const user = await updateUserProfile(req.user._id.toString(), {
      name,
      country,
      photo,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        photo: user.photo,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Update current user password
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const { currentPassword, newPassword } = req.body;
    await updateUserPassword(
      req.user._id.toString(),
      currentPassword,
      newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};
