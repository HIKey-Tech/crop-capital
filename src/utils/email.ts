import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_PASS, EMAIL_USER } from "../config/env";

export const sendEmail = async (to: string, subject: string, html: string) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST, // e.g., smtp.gmail.com
    port: Number(EMAIL_PORT) || 587,
    secure: false, // true for 465
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Send email
  await transporter.sendMail({
    from: `"AYF Investment" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
