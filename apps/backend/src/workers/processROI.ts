import mongoose from "mongoose";
import { MONGO_URI } from "@/config/env";

import {
  Investment,
  IInvestment,
} from "../modules/investments/investment.model";
import { payROI, PayoutInvestor } from "../modules/payments/roi.service";
import { sendEmail } from "@/utils/email";
import cron from "node-cron";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const processROIs = async () => {
  const now = new Date();

  const investments = await Investment.find({
    status: "completed",
    roiPaid: false,
    maturityDate: { $lte: now },
  }).populate<{ investor: PayoutInvestor }>(
    "investor",
    "email name bankAccount",
  );

  for (const inv of investments) {
    const investor = inv.investor as PayoutInvestor;
    const hasBankAccount = Boolean(
      investor?.bankAccount?.accountName &&
      investor.bankAccount.bankCode &&
      investor.bankAccount.accountNumber,
    );

    if (!hasBankAccount) {
      console.log(
        `Investor ${investor?.email ?? "unknown"} has no complete bank payout details. Skipping ROI payout for investment ${inv._id}.`,
      );

      if (investor?.email) {
        await sendEmail(
          investor.email,
          "Action Required: Add Bank Details for ROI Payout",
          `<h1>Your ROI Is Ready — Add Your Bank Details</h1>
            <p>Your investment has matured and your return is ready to be paid out.</p>
            <p>To receive your ROI, please log in and complete your bank account details (account number, bank, and bank code).</p>
            <p>Once updated, your payout will be processed automatically.</p>`,
        ).catch((err) =>
          console.error(
            `Failed to send bank-details reminder to ${investor.email}:`,
            err,
          ),
        );
      }

      continue;
    }

    try {
      const result = await payROI(inv as unknown as IInvestment, investor);
      if (result) {
        console.log(
          `ROI transfer initiated for investment ${inv._id}. Status: ${result.status}. Reference: ${result.reference}`,
        );
      }
    } catch (error) {
      console.error(
        `Failed to initiate ROI transfer for investment ${inv._id}:`,
        error,
      );
    }
  }
};

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Starting ROI payout job...");
  await processROIs();
});

processROIs()
  .then(() => console.log("ROI processing done"))
  .catch(console.error);
