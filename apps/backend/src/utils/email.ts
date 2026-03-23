import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_PASS, EMAIL_USER } from "../config/env";

function hasPlaceholderValue(value?: string | null): boolean {
  if (!value) return true;

  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("your_email") ||
    normalized.includes("your-password") ||
    normalized.includes("app_password") ||
    normalized.includes("example.com")
  );
}

function assertEmailConfig(): void {
  if (
    hasPlaceholderValue(EMAIL_HOST) ||
    hasPlaceholderValue(EMAIL_USER) ||
    hasPlaceholderValue(EMAIL_PASS)
  ) {
    throw new Error("Email service is not configured");
  }
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  assertEmailConfig();

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST, // e.g., smtp.gmail.com
    port: Number(EMAIL_PORT) || 587,
    secure: false, // true for 465
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Send email
  await transporter.sendMail({
    from: `"CropCapital" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
