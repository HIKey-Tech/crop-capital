import { Investment } from "../modules/investments/investment.model";
import { payROI } from "../modules/payments/roi.service";

const processROIs = async () => {
    const investments = await Investment.find({ status: "completed", roiPaid: false }).populate("investor");

    for (const inv of investments) {
        const investorStripeAccountId = (inv.investor as any).stripeAccountId;
        if (!investorStripeAccountId) {
            console.log(`Investor ${inv.investor} has no Stripe account linked.`);
            continue;
        }

        await payROI(inv, investorStripeAccountId);
    }
};

processROIs().then(() => console.log("ROI processing done")).catch(console.error);
