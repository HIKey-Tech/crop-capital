import { User } from "../users/user.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { FRONTEND_URL, JWT_SECRET } from "@/config/env";
import { sendEmail } from "@/utils/email";

export const createToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const createRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  country: string,
) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");
  const user = await User.create({
    name,
    email,
    password,
    role: "investor",
    country,
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid email or password");
  return user;
};
export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("No account found with that email");

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Send email
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  const html = `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `;

  await sendEmail(user.email, "Password Reset Request", html);
  return { message: "Password reset email sent" };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid or expired reset token");

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: "Password reset successful" };
};

export const updateUserProfile = async (
  userId: string,
  data: { name?: string; country?: string; photo?: string },
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (data.name) user.name = data.name;
  if (data.country) user.country = data.country;
  if (data.photo) user.photo = data.photo;

  await user.save();
  return user;
};

export const updateUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new Error("Current password is incorrect");

  user.password = newPassword;
  await user.save();
  return user;
};
