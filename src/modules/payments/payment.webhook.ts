import { Request, Response, NextFunction } from "express";
import { validateWebhookSignature } from "./payment.service";
import { Investment } from "../investments/investment.model";
import { IFarm } from "../farms/farm.model";
import { User } from "../users/user.model";
import { sendEmail } from "@/utils/email";
import { WebhookEvent } from "./webhookEvent.model";
import { logActivity } from "@/modules/activities/activity.service";

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
      [key: string]: unknown;
    };
    customer: {
      id: number;
      email: string;
      customer_code: string;
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
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;

      case "charge.failed":
        await handleChargeFailed(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Mark event as processed
    await WebhookEvent.create({
      paystackEventId: eventId,
      eventType: event.event,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Webhook processing error:", error.message);
    // Don't return error - we want to acknowledge receipt to Paystack
  }

  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
};

async function handleChargeSuccess(data: PaystackWebhookEvent["data"]) {
  const { reference, metadata, amount } = data;

  if (!metadata?.investmentId) {
    console.log("No investmentId in metadata, skipping...");
    return;
  }

  const investment = await Investment.findById(metadata.investmentId).populate(
    "farm",
  );
  if (!investment) {
    console.error(`Investment not found: ${metadata.investmentId}`);
    return;
  }

  // Already completed, skip
  if (investment.status === "completed") {
    console.log(`Investment ${investment._id} already completed`);
    return;
  }

  // Update investment
  investment.status = "completed";
  investment.paystackReference = reference;
  await investment.save();

  // Update farm funded amount
  const farm = investment.farm as IFarm;
  farm.fundedAmount = (farm.fundedAmount || 0) + investment.amount;
  await farm.save();

  // Get investor for email
  const investor = await User.findById(investment.investor);
  if (investor) {
    await sendEmail(
      investor.email,
      "Investment Completed Successfully! 🎉",
      `<h1>Congratulations!</h1>
            <p>Your investment of ₦${(amount / 100).toLocaleString()} in <strong>${farm.name}</strong> has been completed successfully.</p>
            <p><strong>Investment Details:</strong></p>
            <ul>
                <li>Farm: ${farm.name}</li>
                <li>Amount: ₦${investment.amount.toLocaleString()}</li>
                <li>Expected ROI: ${investment.roi}%</li>
                <li>Duration: ${investment.durationMonths} months</li>
                <li>Projected Return: ₦${investment.projectedReturn().toLocaleString()}</li>
            </ul>
            <p>Thank you for investing with AYF Agro!</p>`,
    );
  }

  logActivity({
    type: "investment_completed",
    title: "Investment Completed",
    description: `${investor?.name ?? "An investor"} invested ₦${investment.amount.toLocaleString()} in ${farm.name}`,
    actor: investment.investor as any,
    resourceId: investment._id,
    resourceType: "Investment",
    metadata: {
      farmName: farm.name,
      amount: investment.amount,
      roi: investment.roi,
    },
  });

  console.log(`Investment ${investment._id} completed via Paystack webhook`);
}

async function handleChargeFailed(data: PaystackWebhookEvent["data"]) {
  const { metadata } = data;

  if (!metadata?.investmentId) {
    return;
  }

  const investment = await Investment.findById(metadata.investmentId).populate(
    "farm",
  );
  if (!investment || investment.status !== "pending") {
    return;
  }

  // Optionally notify investor about failed payment
  const investor = await User.findById(investment.investor);
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
  });

  console.log(`Payment failed for investment ${investment._id}`);
}
