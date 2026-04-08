# CropCapital Backend

Express + MongoDB API powering the CropCapital investment platform. Handles authentication, multi-tenancy, farm and investment management, KYC, payments via Paystack, and automated ROI payouts.

---

## Requirements

- Node.js 22.x
- pnpm 9.x
- MongoDB instance (local or Atlas)
- Paystack account (secret key required)

---

## Getting Started

```bash
pnpm install
cp .env.example .env   # fill in values — see Environment Variables below
pnpm dev
```

The server starts on the `PORT` defined in your `.env`.

---

## Environment Variables

### Required

| Variable              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `PORT`                | Port the server listens on                         |
| `MONGO_URI`           | MongoDB connection string                          |
| `JWT_SECRET`          | Secret used to sign JWTs                           |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (from your Paystack dashboard) |
| `FRONTEND_URL`        | Base URL of the frontend application               |
| `ALLOWED_ORIGINS`     | Comma-separated list of CORS-allowed origins       |

### Optional

| Variable                   | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `PAYSTACK_PUBLIC_KEY`      | Paystack public key (for client-side use)                  |
| `EMAIL_HOST`               | SMTP host for outgoing email                               |
| `EMAIL_PORT`               | SMTP port                                                  |
| `EMAIL_USER`               | SMTP username                                              |
| `EMAIL_PASS`               | SMTP password                                              |
| `EMAIL_FROM`               | From address for outgoing emails                           |
| `CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name (for file uploads)                   |
| `CLOUDINARY_API_KEY`       | Cloudinary API key                                         |
| `CLOUDINARY_API_SECRET`    | Cloudinary API secret                                      |
| `DEFAULT_TENANT_SLUG`      | Slug of the default tenant for single-tenant deployments   |
| `PLATFORM_ROOT_DOMAIN`     | Root domain used to resolve tenants from subdomains        |
| `TENANCY_STRICT_MODE`      | Set to `true` to reject requests with no resolvable tenant |
| `TENANT_HEADER_SECRET`     | Shared secret for the `X-Tenant-Secret` header             |
| `TENANT_CACHE_TTL_SECONDS` | How long to cache resolved tenants in memory (default: 30) |

---

## Scripts

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `pnpm dev`                 | Start the server in watch mode (`tsx watch`)    |
| `pnpm build`               | Compile TypeScript to `dist/`                   |
| `pnpm start`               | Run the compiled build                          |
| `pnpm seed`                | Seed the database with initial data             |
| `pnpm backfill:tenant`     | Backfill `tenantId` on existing documents       |
| `pnpm onboard:cropcapital` | Onboard the CropCapital master tenant           |
| `pnpm patch:domains`       | Patch domain records for the CropCapital tenant |

---

## API Modules

| Prefix             | Module                                       |
| ------------------ | -------------------------------------------- |
| `/api/auth`        | Registration, login, password reset, profile |
| `/api/farms`       | Farm listings, creation, updates             |
| `/api/investments` | Investment creation and tracking             |
| `/api/payments`    | Bank list, account resolution, country list  |
| `/api/kyc`         | KYC document submission and review           |
| `/api/users`       | User management (admin)                      |
| `/api/activities`  | Activity feed                                |
| `/api/tenants`     | Tenant management (super admin)              |

---

## Webhooks

All webhook endpoints are registered before the JSON body parser so the raw body is available for signature verification.

### `POST /api/webhooks/paystack`

Receives Paystack charge and transfer events. Requires a valid `x-paystack-signature` header.

**Handled events:**

| Event                                   | Effect                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `charge.success`                        | Marks the investment as completed, calculates and stores `maturityDate`, updates farm `fundedAmount`, emails the investor |
| `charge.failed`                         | Emails the investor about the failed payment                                                                              |
| `transfer.success`                      | Sets `roiPaid = true` on the investment, emails the investor a payout confirmation                                        |
| `transfer.failed` / `transfer.reversed` | Emails the investor, logs the failure — the nightly cron will retry on the next run                                       |

### `POST /api/webhooks/paystack/approve-transfer`

Paystack calls this URL before executing each outbound transfer when a Transfer Approval URL is configured in the Paystack dashboard. The endpoint performs fraud checks and responds with `{ "status": true }` to approve or `{ "status": false }` to reject.

**Setup:** In your [Paystack dashboard](https://dashboard.paystack.com) under **Settings → Transfers → Transfer Approval**, set:

- **Approval URL (live):** `https://your-api-domain.com/api/webhooks/paystack/approve-transfer`
- Check **"Confirm transfers in live mode"**

**Fraud checks performed (all must pass to approve):**

1. **Reference is known** — the `reference` must map to an investment with a stored `payoutReference`; unknown references are rejected
2. **Not already paid** — rejects if `roiPaid` is already `true` on the investment
3. **Investment is completed** — rejects if the investment status is not `completed`
4. **Maturity date has passed** — rejects early payouts
5. **Recipient code matches** — the `recipient_code` in the request must match the `payoutRecipientCode` stored on the investment; prevents tampered recipients
6. **Amount matches** — the transfer amount (in kobo) must equal `projectedReturn() × 100` within a 1-kobo tolerance; rejects inflated amounts

Any rejected transfer is logged with the specific reason. Paystack cancels the transfer when the response is `{ "status": false }`.

---

## ROI Payout Flow

Automated ROI payouts run nightly via a `node-cron` worker (`src/workers/processROI.ts`).

1. Worker queries all investments where `status = completed`, `roiPaid = false`, and `maturityDate <= now`
2. For each eligible investment, `payROI()` in `roi.service.ts`:
   - Creates (or reuses) a Paystack transfer recipient for the investor's bank account
   - Initiates a transfer via the Paystack Transfers API
   - Stores `payoutReference` and `payoutRecipientCode` on the investment
3. Paystack calls the Approval URL — fraud checks run, transfer is approved or rejected
4. On `transfer.success` webhook — `roiPaid` is set to `true`, investor receives a confirmation email
5. On `transfer.failed` / `transfer.reversed` — failure email sent, `roiPaid` remains `false` so the worker retries the next night

Investors with incomplete bank details (missing account number, bank code, or account name) are skipped and sent a reminder email to update their profile.
