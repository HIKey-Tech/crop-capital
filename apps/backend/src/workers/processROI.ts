import mongoose from "mongoose";
import { MONGO_URI } from "@/config/env";

import { Investment } from "../modules/investments/investment.model";
import { payROI } from "../modules/payments/roi.service";
import cron from "node-cron";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

interface PayoutInvestor {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  bankAccount?: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

const processROIs = async () => {
  const investments = await Investment.find({
    status: "completed",
    roiPaid: false,
  }).populate("investor", "email name bankAccount");

  for (const inv of investments) {
    const investor = inv.investor as unknown as PayoutInvestor;
    const hasBankAccount = Boolean(
      investor?.bankAccount?.accountName &&
      investor.bankAccount.bankName &&
      investor.bankAccount.accountNumber,
    );

    if (!hasBankAccount) {
      console.log(
        `Investor ${investor?.email ?? "unknown"} has no complete bank payout details. Skipping ROI payout for investment ${inv._id}.`,
      );
      continue;
    }

    try {
      await payROI(inv);
    } catch (error) {
      console.error(`Failed to pay ROI for investment ${inv._id}:`, error);
    }
  }
};

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Starting direct bank ROI payout job...");
  await processROIs();
});

processROIs()
  .then(() => console.log("ROI processing done"))
  .catch(console.error);
