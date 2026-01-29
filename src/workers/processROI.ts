import mongoose from "mongoose";
import { ENV } from "../config/env";

import {
  Investment,
  IInvestment,
} from "../modules/investments/investment.model";
import { payROI } from "../modules/payments/roi.service";
import cron from "node-cron";

mongoose
  .connect(ENV.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

interface PopulatedInvestor {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  paystackRecipientCode?: string;
}

const processROIs = async () => {
  const investments = await Investment.find({
    status: "completed",
    roiPaid: false,
  }).populate("investor");

  for (const inv of investments) {
    const investor = inv.investor as unknown as PopulatedInvestor;

    // Check if investor has a Paystack recipient code for transfers
    if (!investor.paystackRecipientCode) {
      console.log(
        `Investor ${investor.email} has no Paystack recipient code. Skipping ROI payout.`,
      );
      continue;
    }

    try {
      await payROI(
        inv as unknown as IInvestment & {
          investor: { email: string; name: string };
        },
        investor.paystackRecipientCode,
      );
    } catch (error) {
      console.error(`Failed to pay ROI for investment ${inv._id}:`, error);
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
