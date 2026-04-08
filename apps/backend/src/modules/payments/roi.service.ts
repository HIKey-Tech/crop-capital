import { IInvestment } from "../investments/investment.model";
import { createTransferRecipient, initiateTransfer } from "./payment.service";

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

export interface PayoutInvestor {
  email: string;
  name: string;
  bankAccount?: {
    accountName?: string;
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
  };
}

export interface PayoutInitiatedResult {
  reference: string;
  status: "pending" | "success" | "failed" | "reversed" | "otp";
  amount: number;
  currency: string;
}

/**
 * Initiate an ROI payout to the investor's bank account via Paystack transfer.
 *
 * Creates (or reuses) a transfer recipient, initiates the transfer, and
 * persists the payout reference on the investment document.
 *
 * IMPORTANT: roiPaid is NOT set here. It is set only when the
 * `transfer.success` Paystack webhook fires, confirming actual settlement.
 *
 * @param investment - Investment document (must have projectedReturn() available)
 * @param investor   - Populated investor with bank account details
 */
export async function payROI(
  investment: IInvestment,
  investor: PayoutInvestor,
): Promise<PayoutInitiatedResult | null> {
  if (investment.roiPaid) {
    console.log(`ROI already paid for investment ${investment._id}`);
    return null;
  }

  const { bankAccount } = investor;
  if (
    !bankAccount?.accountNumber ||
    !bankAccount?.bankCode ||
    !bankAccount?.accountName
  ) {
    throw new Error(
      `Investor ${investor.email} is missing required bank details (accountNumber, bankCode, accountName)`,
    );
  }

  const roiAmount = investment.projectedReturn();
  const currency = investment.currency || "NGN";

  // Reuse the stored recipient code to avoid creating duplicates on retries
  let recipientCode = investment.payoutRecipientCode;
  if (!recipientCode) {
    const recipient = await createTransferRecipient({
      name: bankAccount.accountName,
      accountNumber: bankAccount.accountNumber,
      bankCode: bankAccount.bankCode,
      currency,
    });
    recipientCode = recipient.recipientCode;
    investment.payoutRecipientCode = recipientCode;
    await investment.save();
  }

  // Generate a unique reference for this transfer attempt
  const reference = `roi-${investment._id}-${Date.now()}`;

  const transfer = await initiateTransfer({
    recipientCode,
    amount: roiAmount,
    currency,
    reference,
    reason: "Investment ROI payout",
  });

  // Persist the reference so the webhook can correlate it back to this investment
  investment.payoutReference = transfer.reference;
  await investment.save();

  if (transfer.status === "otp") {
    console.warn(
      `Transfer for investment ${investment._id} is pending OTP approval. ` +
        `Reference: ${transfer.reference}. Approve on the Paystack dashboard.`,
    );
  }

  console.log(
    `ROI transfer of ${formatMoney(roiAmount, currency)} initiated for investment ${investment._id}. ` +
      `Status: ${transfer.status}. Reference: ${transfer.reference}`,
  );

  return {
    reference: transfer.reference,
    status: transfer.status,
    amount: roiAmount,
    currency,
  };
}
