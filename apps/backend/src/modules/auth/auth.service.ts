import { User } from "../users/user.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import { FRONTEND_URL, JWT_SECRET } from "@/config/env";
import { assertEmailConfig, sendEmail } from "@/utils/email";

export const createToken = (
  userId: string,
  role: string,
  tenantId?: string,
) => {
  return jwt.sign({ id: userId, role, tenantId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const createRefreshToken = (userId: string, tenantId?: string) => {
  return jwt.sign({ id: userId, tenantId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  country: string,
  tenantId?: string,
) => {
  if (!tenantId) {
    throw new Error("Tenant context is required for signup");
  }

  const existing = await User.findOne(
    tenantId
      ? { email, tenantId: new mongoose.Types.ObjectId(tenantId) }
      : { email },
  );
  if (existing) throw new Error("Email already registered");
  const user = await User.create({
    name,
    email,
    password,
    role: "investor",
    country,
    ...(tenantId ? { tenantId } : {}),
  });
  return user;
};

export const loginUser = async (
  email: string,
  password: string,
  tenantId?: string,
) => {
  const user = await User.findOne(
    tenantId
      ? { email, tenantId: new mongoose.Types.ObjectId(tenantId) }
      : { email, role: "super_admin" },
  );
  if (!user) throw new Error("Invalid email or password");
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid email or password");
  return user;
};
export const forgotPassword = async (email: string, tenantId?: string) => {
  const user = await User.findOne(
    tenantId
      ? { email, tenantId: new mongoose.Types.ObjectId(tenantId) }
      : { email, role: "super_admin" },
  );
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

export const resetPassword = async (
  token: string,
  newPassword: string,
  tenantId?: string,
) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    ...(tenantId
      ? { tenantId: new mongoose.Types.ObjectId(tenantId) }
      : { role: "super_admin" }),
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

export const inviteTenantAdmin = async (
  email: string,
  tenantId: string,
  tenantSlug: string,
) => {
  // Fail fast — check email config before touching the database
  assertEmailConfig();

  const existing = await User.findOne({
    email,
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });
  if (existing)
    throw new Error("A user with that email already exists in this tenant");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const tempPassword = crypto.randomBytes(16).toString("hex");

  let createdUser;
  try {
    createdUser = await User.create({
      name: email.split("@")[0],
      email,
      password: tempPassword,
      role: "admin",
      tenantId: new mongoose.Types.ObjectId(tenantId),
      isVerified: false,
      inviteToken: hashedToken,
      inviteTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (err: any) {
    if (err.code === 11000) {
      throw new Error("A user with that email already exists in this tenant");
    }
    throw err;
  }

  const activateUrl = `${FRONTEND_URL}/${tenantSlug}/auth/activate?token=${rawToken}`;
  const html = `
    <h1>You've been invited as a tenant administrator</h1>
    <p>Click the link below to activate your account and set your name and password:</p>
    <a href="${activateUrl}">Activate Account</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not expect this invitation, you can safely ignore this email.</p>
  `;

  try {
    await sendEmail(email, "Activate Your Admin Account", html);
  } catch (err) {
    // Roll back the user record so the invite can be retried
    await User.findByIdAndDelete(createdUser._id);
    throw err;
  }

  return { message: "Invitation sent successfully" };
};

export const activateAdminAccount = async (
  token: string,
  name: string,
  password: string,
  tenantId?: string,
) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    inviteToken: hashedToken,
    inviteTokenExpires: { $gt: Date.now() },
    ...(tenantId ? { tenantId: new mongoose.Types.ObjectId(tenantId) } : {}),
  });

  if (!user) throw new Error("Invalid or expired invite token");

  user.name = name;
  user.password = password;
  user.isVerified = true;
  user.inviteToken = undefined;
  user.inviteTokenExpires = undefined;
  await user.save();

  return user;
};
