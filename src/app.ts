import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import farmRoutes from "./modules/farms/farm.routes";
import investmentRoutes from "./modules/investments/investment.routes";
import userRoutes from "./modules/users/user.routes";
import { paystackWebhook } from "./modules/payments/payment.webhook";

const app = express();

/* Security */
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
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

/* Error Handler (must be last) */
app.use(errorHandler);

export default app;
