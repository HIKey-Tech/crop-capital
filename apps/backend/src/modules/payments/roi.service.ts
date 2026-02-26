import { PAYSTACK_SECRET_KEY } from "@/config/env";
import { IInvestment } from "../investments/investment.model";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackTransferRecipient {
  type: "nuban" | "mobile_money" | "basa";
  name: string;
  account_number: string;
  bank_code: string;
  currency: string;
}

interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: number;
    status: string;
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Create a transfer recipient on Paystack
 * This is needed before initiating a transfer
 */
export async function createTransferRecipient(
  recipient: PaystackTransferRecipient,
): Promise<{ recipient_code: string }> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipient),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create transfer recipient");
  }

  const data = await response.json();
  return { recipient_code: data.data.recipient_code };
}

/**
 * Initiate a transfer to a recipient
 */
export async function initiateTransfer(
  amount: number, // in main currency unit (Naira)
  recipientCode: string,
  reason: string,
  reference?: string,
): Promise<PaystackTransferResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: Math.round(amount * 100), // Paystack expects kobo
      recipient: recipientCode,
      reason,
      reference,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to initiate transfer");
  }

  return response.json();
}

/**
 * Pay ROI to investor.
 * Note: This requires the investor to have bank account details stored
 * and a transfer recipient created on Paystack.
 *
 * @param investment Investment document (populated with investor)
 * @param recipientCode Paystack recipient code for the investor
 */
export async function payROI(
  investment: IInvestment & { investor: { email: string; name: string } },
  recipientCode: string,
): Promise<PaystackTransferResponse | null> {
  if (investment.roiPaid) {
    console.log(`ROI already paid for investment ${investment._id}`);
    return null;
  }

  const roiAmount = investment.projectedReturn();
  const reference = `roi-${investment._id}-${Date.now()}`;

  const transfer = await initiateTransfer(
    roiAmount,
    recipientCode,
    `ROI payout for investment ${investment._id}`,
    reference,
  );

  // Update investment
  investment.roiPaid = true;
  investment.paystackReference = transfer.data.reference;
  await investment.save();

  console.log(
    `ROI of ₦${roiAmount.toLocaleString()} payout initiated for investment ${investment._id}`,
  );
  return transfer;
}
