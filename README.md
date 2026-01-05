 │   ├─ investments/
 │   │   ├─ investment.model.ts
 │   │   ├─ investment.controller.ts
 │   │   └─ investment.routes.ts
 │   └─ payments/
 │       ├─ payment.service.ts
 │       └─ payment.webhook.ts
 ├─ middlewares/
 │   ├─ auth.middleware.ts
 │   └─ role.middleware.ts
 ├─ utils/
 │   ├─ email.ts
 │   └─ AppError.ts
 ├─ app.ts
 └─ server.ts
Environment Variables (.env)
env
Copy code
PORT=5000
MONGO_URI=<your_mongo_connection_string>
JWT_SECRET=<your_jwt_secret>
STRIPE_SECRET_KEY=<your_stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
EMAIL_HOST=<smtp_host>
EMAIL_PORT=<smtp_port>
EMAIL_USER=<smtp_user>
EMAIL_PASS=<smtp_pass>
Models
1. User Model (user.model.ts)
ts
Copy code
interface IUser {
  name: string;
  email: string;
  password: string;
  role: "investor" | "admin";
  country?: string;
  photo?: string;
  isVerified: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}
Features:

Password hashing before save

Compare password method

Roles: investor, admin

2. Farm Model (farm.model.ts)
ts
Copy code
interface IFarm {
  name: string;
  location: string;
  image?: string;
  investmentGoal: number;
  minimumInvestment: number;
  roi: number;
  durationMonths: number;
  fundedAmount: number;
}
Features:

Tracks funding progress

Admin can post updates and images

3. Investment Model (investment.model.ts)
ts
Copy code
interface IInvestment {
  investor: Types.ObjectId;
  farm: Types.ObjectId | IFarm;
  amount: number;
  roi: number;
  durationMonths: number;
  status: "pending" | "completed" | "cancelled";
  stripePaymentIntentId?: string;
  projectedReturn(): number;
}
Features:

Calculates projected ROI

Stores Stripe PaymentIntent ID for linking payment

Tracks investment status

Controllers
1. Investment Controller
investInFarm – Create a pending investment and Stripe PaymentIntent

Creates investment in DB

Generates Stripe PaymentIntent with investmentId in metadata

Sends confirmation email

completeInvestment – Admin manually completes an investment (optional)

Updates investment status to completed

Updates farm’s fundedAmount

Sends email notification

getMyInvestments – Returns all investments for a user

Includes projected ROI for each investment

2. Payment Webhook (payment.webhook.ts)
Stripe Webhook Endpoint: /api/webhooks/stripe

Listens for payment_intent.succeeded and payment_intent.payment_failed

On success:

Finds investment by stripePaymentIntentId

Updates investment status to completed

Updates farm funded amount

Sends email to investor

On failure:

Optionally notifies the investor

Important: Uses express.raw() middleware to read raw request body for signature verification.

Routes
Investments (investment.routes.ts)

Method	Route	Middleware	Description
POST	/api/investments	protect, restrictTo("investor")	Create a new investment
GET	/api/investments/me	protect, restrictTo("investor")	List investor’s investments
POST	/api/investments/:id/complete	protect, restrictTo("admin")	Admin completes investment

Webhook (app.ts)

ts
Copy code
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
Middleware
Auth Middleware: Validates JWT and attaches user to request

Role Middleware: Restricts access to admin or investor

Payment Flow (Stripe)
Investor creates investment → Stripe PaymentIntent is generated

Stripe processes payment

Stripe sends webhook to /api/webhooks/stripe

Webhook verifies signature

On success:

Investment marked as completed

Farm fundedAmount updated

Email notification sent

Investor dashboard updates automatically

Email Notifications
Investment Created: Payment pending confirmation

Investment Completed: Payment succeeded, projected ROI shown

Optional: Payment failed notification

Uses Nodemailer via SMTP.

MVP Features Summary
Module	Features	Status
Users	Sign Up / Sign In, Profile, Roles, JWT	✅ Ready
Farms	CRUD, Investment info, Funded progress	✅ Ready
Investments	Create, Complete, List, ROI calculation	✅ Ready
Payments	Stripe PaymentIntent, Webhook	✅ Ready
Notifications	Email confirmations, ROI updates	✅ Ready
Admin Dashboard	Manage farms/investments	✅ Optional UI

