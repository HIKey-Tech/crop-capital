import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import farmRoutes from "./modules/farms/farm.routes";
import investmentRoutes from "./modules/investments/investment.routes";
import userRoutes from "./modules/users/user.routes";
import kycRoutes from "./modules/kyc/kyc.routes";
import activityRoutes from "./modules/activities/activity.routes";
import { paystackWebhook } from "./modules/payments/payment.webhook";
import { FRONTEND_URL } from "./config/env";
import { portNumbers } from "get-port";

const app = express();
const portRange = Array.from(portNumbers(3000, 3100));
const ports = portRange.map((port) => `http://localhost:${port}`);

/**
 * Trust only the first proxy (Render's load balancer) for correct client IP detection.
 * This prevents IP spoofing by not trusting X-Forwarded-For headers from untrusted sources.
 * On Render: The load balancer sets X-Forwarded-For, and we trust only that one proxy.
 * See: https://express-rate-limit.mintlify.app/reference/error-codes#err-erl-permissive-trust-proxy
 */
app.set("trust proxy", 1);

const corsOptions = {
  origin: [FRONTEND_URL].concat(ports).filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range", "Content-Length"],
  maxAge: 600,
};

app.use(cors(corsOptions));

/* Security & Rate Limiting */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Rate limiter with proper IP extraction for proxied environments
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Trust proxy is already set, so req.ip will correctly use X-Forwarded-For
    skip: (req) => {
      // Optional: Skip rate limiting for health checks
      return req.path === "/";
    },
  }),
);

/* Paystack Webhook - Must be before express.json() middleware for raw body access */
app.post("/api/webhooks/paystack", express.json(), paystackWebhook);

/* Parse JSON for all other routes */
app.use(express.json());

/* Health Check */
app.get("/", (_, res) => {
  res.json({ status: "AYF Backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/activities", activityRoutes);

/* Error Handler (must be last) */
app.use(errorHandler);

export default app;
