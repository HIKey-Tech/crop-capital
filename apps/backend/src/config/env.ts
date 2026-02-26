import dotenv from "dotenv";

dotenv.config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
  return value;
};

export const PORT = getRequiredEnv("PORT");
export const MONGO_URI = getRequiredEnv("MONGO_URI");
export const JWT_SECRET = getRequiredEnv("JWT_SECRET");
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const PAYSTACK_SECRET_KEY = getRequiredEnv("PAYSTACK_SECRET_KEY");
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const FRONTEND_URL = getRequiredEnv("FRONTEND_URL");
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG;
export const PLATFORM_ROOT_DOMAIN = process.env.PLATFORM_ROOT_DOMAIN;
export const TENANCY_STRICT_MODE = process.env.TENANCY_STRICT_MODE === "true";
export const TENANT_HEADER_SECRET = process.env.TENANT_HEADER_SECRET;
export const TENANT_CACHE_TTL_SECONDS = Number(
  process.env.TENANT_CACHE_TTL_SECONDS ?? "30",
);
