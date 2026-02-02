import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["PORT", "MONGO_URI", "JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
