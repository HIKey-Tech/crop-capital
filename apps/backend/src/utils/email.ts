import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_PASS,
  EMAIL_USER,
  EMAIL_FROM,
} from "../config/env";

export function assertEmailConfig(): void {
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
    throw new Error("Email service is not configured");
  }
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  assertEmailConfig();

  const port = Number(EMAIL_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"CropCapital" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Email delivery failed",
    );
  }
};
