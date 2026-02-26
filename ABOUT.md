# CropCapital — Agricultural Investment Platform

## What Is CropCapital?

CropCapital is a crowdfunding platform that connects everyday investors with verified agricultural farm projects. Users can browse active farm listings, invest money into projects they believe in, and earn a return on investment (ROI) once the farm's investment cycle matures.

Think of it as a marketplace where farmers get the capital they need to operate, and investors get a transparent, structured way to grow their money through agriculture.

## How It Works

1. **Farmers (via Admins) list farm projects** — Each farm has an investment goal, a minimum investment amount, an expected ROI percentage, and a duration (in months).
2. **Investors browse and invest** — Registered users discover farms, review details like location, progress updates, and funding status, then invest via Paystack.
3. **Farms get funded** — As investments come in, the farm's funded amount moves toward its goal.
4. **ROI is paid out** — After the investment period ends, a scheduled background job calculates and distributes returns to investors.

## Who Uses It?

| Role         | What They Do                                                                |
| ------------ | --------------------------------------------------------------------------- |
| **Investor** | Signs up, completes KYC, browses farms, invests money, tracks portfolio/ROI |
| **Admin**    | Creates and manages farm listings, monitors investors, reviews transactions |

## Tech Stack

| Layer        | Stack                                                                |
| ------------ | -------------------------------------------------------------------- |
| **Frontend** | React 19, TanStack Router + Query, Tailwind CSS 4, Radix UI          |
| **Backend**  | Express 5, TypeScript, Mongoose (MongoDB)                            |
| **Payments** | Paystack (webhook-driven verification)                               |
| **Other**    | Cloudinary (images), Nodemailer (emails), node-cron (ROI processing) |

## Key Concepts

- **Farm** — An agricultural project seeking investment. Has a name, location, image, investment goal, minimum buy-in, ROI rate, and duration.
- **Investment** — A record tying an investor to a farm for a specific amount. Tracks payment status (`pending`, `completed`, `cancelled`) and whether ROI has been paid.
- **ROI Processing** — A cron job that runs on schedule, finds matured investments, and marks ROI as paid.
- **KYC** — Know Your Customer verification. Investors submit identity documents before they can invest.
- **Watchlist** — Investors can bookmark farms they're interested in for quick access later.

## Project Structure (High Level)

```
agro-backend/           — Express API server
  src/modules/
    auth/               — Registration, login, JWT tokens
    users/              — User profiles, roles, watchlist
    farms/              — Farm CRUD, progress updates
    investments/        — Investment records, projected returns
    payments/           — Paystack integration, webhooks
    kyc/                — Identity verification
    activities/         — Activity logging
  src/workers/          — Scheduled ROI payout processing

Frontend app/          — React SPA (TanStack Start-style)
  src/routes/           — File-based routing (auth, dashboard, onboarding, etc.)
  src/hooks/            — Data-fetching hooks per domain (farms, investments, auth…)
  src/components/       — UI components (dashboard, layout, invest, shared ui)
  src/lib/              — Utilities (API client, formatting, file helpers)
```

## Current Status

The platform has a working backend with authentication, farm management, investment tracking, KYC, and Paystack payment processing. The frontend has authentication flows, a dashboard, farm discovery, investment management, and an admin panel. Core infrastructure is in place — active development is focused on completing the investment checkout flow, notifications, admin analytics, and data export features.
