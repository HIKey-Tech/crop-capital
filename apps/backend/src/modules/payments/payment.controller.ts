import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { listBanks, resolveAccountNumber } from "./payment.service";

export const getBanks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const country =
      typeof req.query.country === "string" ? req.query.country : "";

    if (!country.trim()) {
      throw new AppError("Country is required to fetch banks", 400);
    }

    const banks = await listBanks(country);

    res.status(200).json({
      success: true,
      supported: banks.length > 0,
      banks,
    });
  } catch (err: any) {
    next(new AppError(err.message || "Failed to fetch banks", 400));
  }
};

export const resolveAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accountNumber =
      typeof req.query.accountNumber === "string"
        ? req.query.accountNumber
        : "";
    const bankCode =
      typeof req.query.bankCode === "string" ? req.query.bankCode : "";

    if (!accountNumber.trim() || !bankCode.trim()) {
      throw new AppError("Account number and bank code are required", 400);
    }

    const account = await resolveAccountNumber(accountNumber, bankCode);

    res.status(200).json({
      success: true,
      resolved: Boolean(account),
      accountName: account?.accountName ?? null,
      accountNumber: account?.accountNumber ?? null,
    });
  } catch (err: any) {
    next(new AppError(err.message || "Failed to resolve bank account", 400));
  }
};
