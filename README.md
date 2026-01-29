Welcome to your new TanStack app!

# Getting Started

To run this application:

```bash
npm install
npm run start
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
npm run lint
npm run format
npm run check
```

## 🌾 AYF Agro - Agricultural Investment Platform

This is a **crowdfunding/investment platform for agricultural projects (farms)**. It connects investors with verified farm projects, allowing them to invest money and earn ROI over time.

### Core Business Model

- **Investors** can browse and invest in agricultural farm projects
- **Farms** have investment goals, minimum investment amounts, ROI percentages, and duration periods
- **Admins** manage farms, investors, reports, and transactions
- Investors receive **ROI payouts** after the investment matures

---

## Current Tech Stack

| Layer        | Technology                                                                     |
| ------------ | ------------------------------------------------------------------------------ |
| **Frontend** | React 19, TanStack Router, TanStack Query, Tailwind CSS 4, Radix UI, Vite      |
| **Backend**  | Express 5, TypeScript, Mongoose/MongoDB                                        |
| **Payments** | ⚠️ Currently Stripe (needs migration to **Paystack**)                          |
| **Other**    | Cloudinary (images), Nodemailer (emails), node-cron (scheduled ROI processing) |

---

## Key Modules

### Backend (agro-backend)

- **Auth** - User registration, login, JWT authentication
- **Users** - Investor and admin roles, email verification
- **Farms** - CRUD operations, investment tracking, progress updates
- **Investments** - Investment records, ROI calculation, status tracking
- **Payments** - ⚠️ Stripe integration (needs Paystack replacement)
- **Workers** - Scheduled ROI processing via cron jobs

### Frontend (AYF-Agro---frontend)

- Dashboard with stats (total invested, active projects, ROI earned)
- Farm discovery and search
- Investment management
- Admin panel (farms, investors, reports, transactions)
- Currently using **mock data** - needs API integration

---

## What Needs to Be Done

1. **🔄 Replace Stripe with Paystack** - The payment.service.ts currently uses Stripe. Paystack supports Nigerian Naira (NGN) and other African currencies.

2. **🔗 Connect Frontend to Backend** - Frontend is using mock data; needs proper API integration with TanStack Query.

3. **🚀 Deployment Configuration**
   - Backend → **Render** (need environment setup, build commands)
   - Frontend → **Vercel** (Vite config is ready)

4. **🔧 Complete Features** - Webhook handling, ROI payout automation, email notifications, etc.

---

Ready to start working! What would you like to tackle first?

- Migrate payments from Stripe to **Paystack**?
- Set up **API integration** in the frontend?
- Configure **deployment** for Render/Vercel?
- Something else?
