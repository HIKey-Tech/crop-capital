import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { ENV } from "../../config/env";
import { Investment } from "../investments/investment.model";
import { Farm, IFarm } from "../farms/farm.model";
import { sendEmail } from "../../utils/email";
import { AppError } from "../../utils/AppError";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: "2025-12-15.clover" });

// Webhook endpoint
export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            try {
                // Find investment by paymentIntent ID (store paymentIntent.id in investment)
                const investment = await Investment.findOne({ _id: paymentIntent.metadata?.investmentId }).populate("farm");
                if (!investment) throw new Error("Investment not found");

                if (investment.status !== "completed") {
                    investment.status = "completed";
                    await investment.save();

                    const farm = investment.farm as IFarm;
                    farm.fundedAmount = (farm.fundedAmount || 0) + investment.amount;
                    await farm.save();

                    // Send email to investor
                    const investorEmail = (investment.investor as any).email; // populate if needed
                    await sendEmail(
                        investorEmail,
                        "Investment Completed",
                        `<h1>Congratulations!</h1>
             <p>Your investment in ${farm.name} has been completed.</p>
             <p>Projected Return: $${investment.projectedReturn()}</p>`
                    );
                }
            } catch (err: any) {
                console.error("Webhook processing error:", err.message);
            }

            break;

        case "payment_intent.payment_failed":
            const failedIntent = event.data.object as Stripe.PaymentIntent;
            // Optionally notify investor
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};
