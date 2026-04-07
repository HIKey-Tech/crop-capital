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
  activateAdminAccount,
} from "./auth.service";
import { AppError } from "@/utils/AppError";
import { logActivity } from "@/modules/activities/activity.service";
import { deleteImage, uploadImageBuffer } from "@/utils/cloudinary";

const toOptionalTrimmedString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, country } = req.body;
    const tenantId = req.tenant?._id?.toString();

    const user = await signupUser(name, email, password, country, tenantId);
    const token = createToken(user.id, user.role, tenantId);
    const refreshToken = createRefreshToken(user.id, tenantId);

    logActivity({
      type: "user_signup",
      title: "New Investor",
      description: `${user.name} joined the platform`,
      actor: user._id,
      resourceId: user._id,
      resourceType: "User",
      metadata: { email: user.email, country },
      tenantId,
    });

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
    const tenantId = req.tenant?._id?.toString();
    const user = await loginUser(email, password, tenantId);
    const token = createToken(user.id, user.role, tenantId);
    const refreshToken = createRefreshToken(user.id, tenantId);
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
    const tenantId = req.tenant?._id?.toString();
    const tenantSlug = req.tenant?.slug;
    const result = await forgotPassword(email, tenantId, tenantSlug);
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
    const tenantId = req.tenant?._id?.toString();
    const result = await resetPassword(token, password, tenantId);
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
        bankAccount: req.user.bankAccount,
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

    const name = toOptionalTrimmedString(req.body.name);
    const country = toOptionalTrimmedString(req.body.country);
    const removePhoto = req.body.removePhoto === "true";

    const bankAccount = Object.prototype.hasOwnProperty.call(
      req.body,
      "bankAccount.accountName",
    )
      ? {
          accountName: toOptionalTrimmedString(
            req.body["bankAccount.accountName"],
          ),
          bankName: toOptionalTrimmedString(req.body["bankAccount.bankName"]),
          bankCode: toOptionalTrimmedString(req.body["bankAccount.bankCode"]),
          accountNumber: toOptionalTrimmedString(
            req.body["bankAccount.accountNumber"],
          ),
        }
      : undefined;

    let photo: string | undefined;
    let photoPublicId: string | undefined;

    if (req.file) {
      const uploadedPhoto = await uploadImageBuffer(
        req.file.buffer,
        "profile-photos",
      );
      photo = uploadedPhoto.url;
      photoPublicId = uploadedPhoto.publicId;
    }

    if ((removePhoto || req.file) && req.user.photoPublicId) {
      await deleteImage(req.user.photoPublicId);
    }

    const user = await updateUserProfile(req.user._id.toString(), {
      name,
      country,
      photo,
      photoPublicId,
      removePhoto,
      bankAccount,
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
        bankAccount: user.bankAccount,
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

// Activate an invited admin account
export const activateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, name, password } = req.body;
    const tenantId = req.tenant?._id?.toString();
    const user = await activateAdminAccount(token, name, password, tenantId);
    const authToken = createToken(user.id, user.role, tenantId);
    const refreshToken = createRefreshToken(user.id, tenantId);
    res
      .status(200)
      .json({ success: true, token: authToken, refreshToken, user });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};
