import { Request, Response, NextFunction } from "express";
import { Investment } from "./investment.model";
import { Farm } from "../farms/farm.model";
import {
  initializeTransaction,
  verifyTransaction,
} from "../payments/payment.service";
import { FRONTEND_URL } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { sendEmail } from "@/utils/email";

const getCurrencyLocale = (currency: string) => {
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
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(getCurrencyLocale(currency), {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const sendInvestmentEmailBestEffort = async (
  email: string,
  subject: string,
  html: string,
) => {
  try {
    await sendEmail(email, subject, html);
  } catch (error) {
    console.error("Investment email delivery failed", error);
  }
};

// Investor: make investment
export const investInFarm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const { farmId, amount } = req.body;
    const investor = req.user!; // from auth middleware

    const farm = await Farm.findOne({
      _id: farmId,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!farm) return next(new AppError("Farm not found", 404));

    const currency = farm.currency || "NGN";

    if (amount < farm.minimumInvestment) {
      return next(
        new AppError(
          `Minimum investment is ${formatMoney(farm.minimumInvestment, currency)}`,
          400,
        ),
      );
    }

    // Create pending investment first
    const investment = await Investment.create({
      ...(tenantId ? { tenantId } : {}),
      investor: investor._id,
      farm: farm._id,
      amount,
      currency,
      roi: farm.roi,
      durationMonths: farm.durationMonths,
      status: "pending",
    });

    const callbackUrl = req.tenant?.slug
      ? `${FRONTEND_URL}/${req.tenant.slug}/payment/callback`
      : `${FRONTEND_URL}/payment/callback`;

    // Initialize Paystack transaction with metadata
    const paystackResponse = await initializeTransaction(
      investor.email,
      amount,
      {
        investmentId: investment._id.toString(),
        tenantId: tenantId?.toString(),
        tenantSlug: req.tenant?.slug,
        farmId: farm._id.toString(),
        farmName: farm.name,
        currency,
      },
      currency,
      callbackUrl,
    );

    // Store Paystack reference and access code
    investment.paystackReference = paystackResponse.data.reference;
    investment.paystackAccessCode = paystackResponse.data.access_code;
    await investment.save();

    // Do not fail the investment flow if email delivery is unavailable.
    await sendInvestmentEmailBestEffort(
      investor.email,
      "Investment Created - Complete Your Payment",
      `<h1>Investment Pending</h1>
        <p>You're investing ${formatMoney(amount, currency)} in <strong>${farm.name}</strong>.</p>
            <p>Please complete your payment to finalize the investment.</p>
            <p><a href="${paystackResponse.data.authorization_url}" style="background-color: #00C853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Payment</a></p>`,
    );

    res.status(201).json({
      success: true,
      message: "Investment created. Please complete payment.",
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
      investmentId: investment._id,
      currency,
    });
  } catch (err: unknown) {
    const error = err as Error;
    next(new AppError(error.message, 400));
  }
};

// Verify payment after callback (optional - webhook handles this too)
export const verifyPayment = async (
  req: Request<{ reference: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const { reference } = req.params;

    if (!reference) {
      return next(new AppError("Payment reference is required", 400));
    }

    const paystackResponse = await verifyTransaction(reference);

    if (paystackResponse.data.status !== "success") {
      return next(new AppError("Payment not successful", 400));
    }

    const investment = await Investment.findOne({
      paystackReference: reference,
      ...(tenantId ? { tenantId } : {}),
    }).populate("farm");
    if (!investment) {
      return next(new AppError("Investment not found", 404));
    }

    // If not already completed (webhook might have handled it)
    if (investment.status !== "completed") {
      investment.status = "completed";
      await investment.save();

      const farm = investment.farm as any;
      farm.fundedAmount = (farm.fundedAmount || 0) + investment.amount;
      await farm.save();
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      investment: {
        _id: investment._id,
        amount: investment.amount,
        currency: investment.currency,
        status: investment.status,
        projectedReturn: investment.projectedReturn(),
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    next(new AppError(error.message, 400));
  }
};

// Admin: manually complete investment (optional if you do manual verification)
export const completeInvestment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const investment = await Investment.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    }).populate("farm investor");

    if (!investment) return next(new AppError("Investment not found", 404));

    if (investment.status === "completed") {
      return next(new AppError("Investment already completed", 400));
    }

    // Mark as completed
    investment.status = "completed";
    await investment.save();

    // Update farm funded amount
    const farm = investment.farm as any;
    farm.fundedAmount = (farm.fundedAmount || 0) + investment.amount;
    await farm.save();

    const investor = investment.investor as any;

    await sendInvestmentEmailBestEffort(
      investor.email,
      "Investment Completed",
      `<h1>Congratulations!</h1>
            <p>Your investment in ${farm.name} has been completed.</p>
        <p>Projected Return: ${formatMoney(investment.projectedReturn(), investment.currency || "NGN")}</p>`,
    );

    res.json({
      success: true,
      investment,
      projectedReturn: investment.projectedReturn(),
      message: "Investment completed successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;
    next(new AppError(error.message, 400));
  }
};

// Investor: list my investments
export const getMyInvestments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const investments = await Investment.find({
      investor: req.user!._id,
      ...(tenantId ? { tenantId } : {}),
    }).populate("farm");

    // Add projected return for each investment
    const data = investments.map((inv) => ({
      _id: inv._id,
      farm: inv.farm,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      roi: inv.roi,
      projectedReturn: inv.projectedReturn(),
      durationMonths: inv.durationMonths,
      roiPaid: inv.roiPaid,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    }));

    res.json({ success: true, investments: data });
  } catch (err: unknown) {
    const error = err as Error;
    next(new AppError(error.message, 400));
  }
};

// Get single investment by ID
export const getInvestmentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const investment = await Investment.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    }).populate("farm");

    if (!investment) {
      return next(new AppError("Investment not found", 404));
    }

    // Check ownership: investor can only see their own, admin can see all
    const user = req.user!;
    const canViewAllAsAdmin =
      user.role === "admin" && Boolean(req.tenant?.features?.adminTransactions);

    if (
      !canViewAllAsAdmin &&
      investment.investor.toString() !== user._id.toString()
    ) {
      return next(
        new AppError("You do not have permission to view this investment", 403),
      );
    }

    res.json({
      success: true,
      investment: {
        _id: investment._id,
        farm: investment.farm,
        amount: investment.amount,
        currency: investment.currency,
        status: investment.status,
        roi: investment.roi,
        projectedReturn: investment.projectedReturn(),
        durationMonths: investment.durationMonths,
        roiPaid: investment.roiPaid,
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    next(new AppError(error.message, 400));
  }
};

// Admin: get all investments
export const getAllInvestments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const investments = await Investment.find(tenantId ? { tenantId } : {})
      .populate("farm")
      .populate("investor", "name email");

    // Add projected return for each investment
    const data = investments.map((inv) => ({
      _id: inv._id,
      investor: inv.investor,
      farm: inv.farm,
      amount: inv.amount,
      currency: inv.currency,
      status: inv.status,
      roi: inv.roi,
      projectedReturn: inv.projectedReturn(),
      durationMonths: inv.durationMonths,
      roiPaid: inv.roiPaid,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    }));

    res.json({ success: true, investments: data });
  } catch (err: unknown) {
    const error = err as Error;
    next(new AppError(error.message, 400));
  }
};
