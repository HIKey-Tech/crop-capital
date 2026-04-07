import { IInvestment } from "../investments/investment.model";

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

interface DirectPayoutResult {
  status: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    processedAt: string;
    reference: string;
    channel: "bank_transfer";
  };
}

/**
 * Mark ROI as distributed directly to the investor's bank account.
 *
 * This keeps the original incoming payment reference intact and only marks
 * the return as paid so downstream dashboards can reflect the bank payout.
 *
 * @param investment Investment document
 */
export async function payROI(
  investment: IInvestment,
): Promise<DirectPayoutResult | null> {
  if (investment.roiPaid) {
    console.log(`ROI already paid for investment ${investment._id}`);
    return null;
  }

  const roiAmount = investment.projectedReturn();
  const reference = `roi-${investment._id}-${Date.now()}`;
  const currency = investment.currency || "NGN";

  investment.roiPaid = true;
  await investment.save();

  console.log(
    `ROI of ${formatMoney(roiAmount, currency)} marked as paid directly to bank for investment ${investment._id}`,
  );

  return {
    status: true,
    message: "ROI marked as paid via direct bank payout",
    data: {
      amount: roiAmount,
      currency,
      processedAt: new Date().toISOString(),
      reference,
      channel: "bank_transfer",
    },
  };
}
