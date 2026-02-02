declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PORT: string;
    readonly MONGO_URI: string;
    readonly JWT_SECRET: string;
    readonly PAYSTACK_SECRET_KEY: string;
    readonly PAYSTACK_PUBLIC_KEY: string;
    readonly EMAIL_HOST: string;
    readonly EMAIL_PORT: string;
    readonly EMAIL_USER: string;
    readonly EMAIL_PASS: string;
    readonly FRONTEND_URL: string;
    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly CLOUDINARY_API_KEY: string;
    readonly CLOUDINARY_API_SECRET: string;
  }
}
