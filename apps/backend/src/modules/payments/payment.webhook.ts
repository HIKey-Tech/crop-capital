import { Request, Response, NextFunction } from "express";
import { validateWebhookSignature } from "./payment.service";
import { Investment } from "../investments/investment.model";
import { IFarm } from "../farms/farm.model";
import { User } from "../users/user.model";
import { sendEmail } from "@/utils/email";
import { WebhookEvent } from "./webhookEvent.model";
import { logActivity } from "@/modules/activities/activity.service";

function getCurrencyLocale(currency: string): string {
  switch (currency) {
    case "USD":
      return "en-US";
    case "GHS":
      return "en-GH";
    case "KES":
      return "en-KE";
    case "NGN":
    default:
      return "en-NG";
  }
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(getCurrencyLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: "success" | "failed" | "abandoned";
    paid_at: string;
    channel: string;
    metadata: {
      investmentId?: string;
      tenantId?: string;
      tenantSlug?: string;
      [key: string]: unknown;
    };
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

interface TransferWebhookEvent {
  event: "transfer.success" | "transfer.failed" | "transfer.reversed";
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: "success" | "failed" | "reversed" | "otp";
    reason?: string;
    recipient: {
      recipient_code: string;
      name: string;
      details: {
        account_number: string;
        bank_name: string;
      };
    };
  };
}

export const paystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const signature = req.headers["x-paystack-signature"] as string;

  // Validate webhook signature
  const rawBody = JSON.stringify(req.body);
  if (!validateWebhookSignature(rawBody, signature)) {
    console.error("Invalid Paystack webhook signature");
    return res.status(401).send("Invalid signature");
  }

  const event = req.body as PaystackWebhookEvent;
  const eventId = `${event.event}-${event.data.id}`;

  // Check if event has been processed before (idempotency)
  const existing = await WebhookEvent.findOne({ paystackEventId: eventId });
  if (existing) {
    console.log(`Event ${eventId} already processed. Skipping.`);
    return res.status(200).json({ received: true });
  }

  try {
    let tenantId: string | undefined;

    switch (event.event) {
      case "charge.success":
        tenantId = await handleChargeSuccess(event.data);
        break;

      case "charge.failed":
        tenantId = await handleChargeFailed(event.data);
        break;

      case "transfer.success":
        await handleTransferSuccess(
          (event as unknown as TransferWebhookEvent).data,
        );
        break;

      case "transfer.failed":
      case "transfer.reversed":
        await handleTransferFailed(
          (event as unknown as TransferWebhookEvent).data,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Mark event as processed
    await WebhookEvent.create({
      paystackEventId: eventId,
      eventType: event.event,
      tenantId,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Webhook processing error:", error.message);
    // Don't return error - we want to acknowledge receipt to Paystack
  }

  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
};

async function handleChargeSuccess(
  data: PaystackWebhookEvent["data"],
): Promise<string | undefined> {
  const { reference, metadata, amount } = data;

  if (!metadata?.investmentId) {
    console.log("No investmentId in metadata, skipping...");
    return undefined;
  }

  const investment = await Investment.findOne({
    _id: metadata.investmentId,
    ...(metadata.tenantId ? { tenantId: metadata.tenantId } : {}),
  }).populate("farm");
  if (!investment) {
    console.error(`Investment not found: ${metadata.investmentId}`);
    return undefined;
  }

  const investmentTenantId = investment.tenantId?.toString();
  if (metadata.tenantId && metadata.tenantId !== investmentTenantId) {
    console.error("Tenant mismatch in webhook metadata and investment record");
    return undefined;
  }

  // Already completed, skip
  if (investment.status === "completed") {
    console.log(`Investment ${investment._id} already completed`);
    return investmentTenantId;
  }

  // Update investment
  investment.status = "completed";
  investment.paystackReference = reference;
  const maturity = new Date(data.paid_at ?? Date.now());
  maturity.setMonth(maturity.getMonth() + investment.durationMonths);
  investment.maturityDate = maturity;
  await investment.save();
  const currency = investment.currency || data.currency || "NGN";

  // Update farm funded amount
  const farm = investment.farm as IFarm;
  if (
    farm.tenantId &&
    investment.tenantId &&
    farm.tenantId.toString() !== investment.tenantId.toString()
  ) {
    console.error("Tenant mismatch between farm and investment");
    return undefined;
  }

  farm.fundedAmount = (farm.fundedAmount || 0) + investment.amount;
  await farm.save();

  // Get investor for email
  const investor = await User.findOne({
    _id: investment.investor,
    ...(investment.tenantId ? { tenantId: investment.tenantId } : {}),
  });
  if (investor) {
    await sendEmail(
      investor.email,
      "Investment Completed Successfully! 🎉",
      `<h1>Congratulations!</h1>
        <p>Your investment of ${formatMoney(amount / 100, currency)} in <strong>${farm.name}</strong> has been completed successfully.</p>
            <p><strong>Investment Details:</strong></p>
            <ul>
                <li>Farm: ${farm.name}</li>
          <li>Amount: ${formatMoney(investment.amount, currency)}</li>
                <li>Expected ROI: ${investment.roi}%</li>
                <li>Duration: ${investment.durationMonths} months</li>
          <li>Projected Return: ${formatMoney(investment.projectedReturn(), currency)}</li>
            </ul>
            <p>Thank you for investing with CropCapital!</p>`,
    );
  }

  logActivity({
    type: "investment_completed",
    title: "Investment Completed",
    description: `${investor?.name ?? "An investor"} invested ${formatMoney(investment.amount, currency)} in ${farm.name}`,
    actor: investment.investor as any,
    resourceId: investment._id,
    resourceType: "Investment",
    metadata: {
      farmName: farm.name,
      amount: investment.amount,
      roi: investment.roi,
    },
    tenantId: investmentTenantId,
  });

  console.log(`Investment ${investment._id} completed via Paystack webhook`);
  return investmentTenantId;
}

async function handleChargeFailed(
  data: PaystackWebhookEvent["data"],
): Promise<string | undefined> {
  const { metadata } = data;

  if (!metadata?.investmentId) {
    return undefined;
  }

  const investment = await Investment.findOne({
    _id: metadata.investmentId,
    ...(metadata.tenantId ? { tenantId: metadata.tenantId } : {}),
  }).populate("farm");
  if (!investment || investment.status !== "pending") {
    return undefined;
  }

  // Optionally notify investor about failed payment
  const investor = await User.findOne({
    _id: investment.investor,
    ...(investment.tenantId ? { tenantId: investment.tenantId } : {}),
  });
  const farm = investment.farm as IFarm;

  if (investor) {
    await sendEmail(
      investor.email,
      "Payment Failed - Action Required",
      `<h1>Payment Failed</h1>
            <p>Your payment for the investment in <strong>${farm.name}</strong> could not be processed.</p>
            <p>Please try again or contact support if the issue persists.</p>`,
    );
  }

  logActivity({
    type: "investment_failed",
    title: "Payment Failed",
    description: `Payment failed for investment in ${farm.name}`,
    actor: investment.investor as any,
    resourceId: investment._id,
    resourceType: "Investment",
    tenantId: investment.tenantId?.toString(),
  });

  console.log(`Payment failed for investment ${investment._id}`);
  return investment.tenantId?.toString();
}

async function handleTransferSuccess(
  data: TransferWebhookEvent["data"],
): Promise<void> {
  const investment = await Investment.findOne({
    payoutReference: data.reference,
  });
  if (!investment) {
    console.warn(
      `transfer.success — no investment found for reference ${data.reference}`,
    );
    return;
  }

  if (investment.roiPaid) {
    console.log(`ROI already marked paid for investment ${investment._id}`);
    return;
  }

  investment.roiPaid = true;
  await investment.save();

  const currency = investment.currency || data.currency || "NGN";
  const amount = data.amount / 100;

  const investor = await User.findById(investment.investor);
  if (investor) {
    await sendEmail(
      investor.email,
      "Your ROI Has Been Paid! 🎉",
      `<h1>ROI Payout Successful</h1>
        <p>Great news! Your investment return of ${formatMoney(amount, currency)} has been successfully transferred to your bank account.</p>
        <p><strong>Transfer Details:</strong></p>
        <ul>
          <li>Amount: ${formatMoney(amount, currency)}</li>
          <li>Reference: ${data.reference}</li>
          <li>Recipient: ${data.recipient.name} — ${data.recipient.details.bank_name} ${data.recipient.details.account_number}</li>
        </ul>
        <p>Thank you for investing with CropCapital!</p>`,
    );
  }

  logActivity({
    type: "roi_paid",
    title: "ROI Payout Successful",
    description: `ROI of ${formatMoney(amount, currency)} paid to ${investor?.name ?? "investor"}`,
    actor: investment.investor as any,
    resourceId: investment._id,
    resourceType: "Investment",
    tenantId: investment.tenantId?.toString(),
  });

  console.log(
    `ROI paid for investment ${investment._id}. Reference: ${data.reference}`,
  );
}

async function handleTransferFailed(
  data: TransferWebhookEvent["data"],
): Promise<void> {
  const investment = await Investment.findOne({
    payoutReference: data.reference,
  });
  if (!investment) {
    console.warn(
      `transfer.failed/reversed — no investment found for reference ${data.reference}`,
    );
    return;
  }

  const currency = investment.currency || data.currency || "NGN";
  const amount = data.amount / 100;
  const eventLabel = data.status === "reversed" ? "reversed" : "failed";

  const investor = await User.findById(investment.investor);
  if (investor) {
    await sendEmail(
      investor.email,
      "ROI Payout Issue — We're On It",
      `<h1>ROI Transfer ${eventLabel.charAt(0).toUpperCase() + eventLabel.slice(1)}</h1>
        <p>We encountered an issue processing your ROI payout of ${formatMoney(amount, currency)}.</p>
        <p>Our team will retry the transfer automatically. If this persists, please contact support.</p>
        <p><strong>Reference:</strong> ${data.reference}</p>`,
    );
  }

  logActivity({
    type: "investment_failed",
    title: `ROI Payout ${eventLabel}`,
    description: `ROI transfer ${eventLabel} for investment ${investment._id}. Reference: ${data.reference}`,
    actor: investment.investor as any,
    resourceId: investment._id,
    resourceType: "Investment",
    tenantId: investment.tenantId?.toString(),
  });

  console.error(
    `ROI transfer ${eventLabel} for investment ${investment._id}. Reference: ${data.reference}`,
  );
}

interface TransferApprovalRequest {
  transfer_code: string;
  amount: number; // kobo
  currency: string;
  reference: string;
  reason?: string;
  recipient: {
    recipient_code: string;
    name: string;
    details: {
      account_number: string;
      bank_name: string;
    };
  };
}

/**
 * Paystack transfer approval endpoint.
 *
 * Paystack POSTs here before executing each transfer when the Approval URL
 * is configured in the dashboard. We run fraud checks and respond with
 * { status: true } to approve or { status: false } to reject.
 *
 * Checks performed:
 * 1. Reference must match a known investment payoutReference (not a phantom payout)
 * 2. Amount (kobo) must match the investment's projectedReturn within a 1-kobo tolerance
 * 3. Recipient code must match the stored payoutRecipientCode
 * 4. Investment must be completed, not already paid, and past maturity
 */
export const paystackTransferApproval = async (req: Request, res: Response) => {
  const body = req.body as TransferApprovalRequest;
  const { reference, amount, recipient } = body;

  const reject = (reason: string) => {
    console.warn(
      `Transfer approval REJECTED — ${reason}. Reference: ${reference}`,
    );
    return res.status(200).json({ status: false });
  };

  if (!reference) {
    return reject("missing reference in request body");
  }

  const investment = await Investment.findOne({ payoutReference: reference });
  if (!investment) {
    return reject(`no investment found for payout reference ${reference}`);
  }

  // Guard: already paid (duplicate approval attempt)
  if (investment.roiPaid) {
    return reject(`investment ${investment._id} is already marked roiPaid`);
  }

  // Guard: investment must be completed and past maturity date
  if (investment.status !== "completed") {
    return reject(
      `investment ${investment._id} status is ${investment.status}, not completed`,
    );
  }
  if (!investment.maturityDate || investment.maturityDate > new Date()) {
    return reject(`investment ${investment._id} has not yet matured`);
  }

  // Guard: recipient code must match what we stored — prevents tampered recipient
  if (
    investment.payoutRecipientCode &&
    recipient?.recipient_code !== investment.payoutRecipientCode
  ) {
    return reject(
      `recipient code mismatch: expected ${investment.payoutRecipientCode}, got ${recipient?.recipient_code}`,
    );
  }

  // Guard: amount in kobo must match projectedReturn (within 1 kobo for rounding)
  const expectedKobo = Math.round(investment.projectedReturn() * 100);
  if (Math.abs(amount - expectedKobo) > 1) {
    return reject(
      `amount mismatch: expected ${expectedKobo} kobo, got ${amount} kobo for investment ${investment._id}`,
    );
  }

  console.log(
    `Transfer approval APPROVED for investment ${investment._id}. Reference: ${reference}`,
  );

  return res.status(200).json({ status: true });
};
