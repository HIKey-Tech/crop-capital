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

## 🚫 Missing Screens

Based on my analysis, here are the **missing screens** for the AYF Agro platform:

### **User/Investor Screens**

1. **Profile/Settings Page** - Edit personal info, change password, notification preferences
2. **Email Verification Page** - For confirming email after registration
3. **Wallet/Portfolio Page** - Detailed breakdown of all investments, ROI history, total portfolio value
4. **Farm Edit Page (Admin)** - Edit existing farm details (only "new farm" exists)
5. **Investment History Details** - Individual investment details page (timeline, documents, updates)
6. **Notifications Center** - In-app notifications for investments, ROI payouts, farm updates
7. **Help/FAQ/Support Page** - Contact form, frequently asked questions
8. **Terms & Conditions/Privacy Policy** - Legal pages (required for production)

### **Admin Screens**

1. **Farm Edit Page** - `/admin/farms/:id/edit` (only create exists)
2. **User Details Page** - `/admin/investors/:id` (view/edit individual investor)
3. **Farm Analytics** - Detailed analytics per farm (investment breakdown, investor list)
4. **ROI Payout Management** - Manual trigger/view ROI payment history
5. **Admin User Management** - Promote/demote users, manage admin roles (backend exists but no UI)
6. **Email Campaigns** - Send updates/newsletters to investors
7. **Withdrawal Requests** - If investors can withdraw before maturity
8. **KYC/Verification Requests** - Review investor verification documents

### **Missing Features on Existing Screens**

- **Dashboard**: No portfolio allocation chart, no recent activity feed
- **Discover**: Missing filters (by location, ROI, duration, status), no search bar
- **Farm Details**: Missing farm documents/contracts, no investor comments/Q&A
- **My Investments**: No download statements, no detailed ROI breakdown
- **Transactions**: Missing export to CSV/PDF, no payment receipt download
- **Admin Reports**: Charts exist but no data export functionality

### **Payment/Onboarding**

- **Investment Checkout Flow** - Multi-step payment with Paystack integration
- **KYC Upload Page** - For investor verification (if required)
- **Welcome/Onboarding Screens** - First-time user tutorial

### **Critical Missing Pieces**

- ❌ **404 Page** - Not found error page
- ❌ **Error Boundary UI** - For handling app crashes
- ❌ **Loading/Skeleton States** - Many pages missing proper loading states
- ❌ **Empty States** - When user has no investments/farms

Would you like me to prioritize and implement any of these screens?
