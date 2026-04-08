import mongoose, { Schema, Document, Types } from "mongoose";
import { IFarm } from "../farms/farm.model";

export const SUPPORTED_INVESTMENT_CURRENCIES = [
  "NGN",
  "USD",
  "GHS",
  "KES",
] as const;
export type InvestmentCurrency =
  (typeof SUPPORTED_INVESTMENT_CURRENCIES)[number];

export interface IInvestment extends Document {
  tenantId?: Types.ObjectId;
  investor: Types.ObjectId; // reference to User
  farm: Types.ObjectId | IFarm; // populated
  amount: number;
  currency: InvestmentCurrency;
  roi: number;
  durationMonths: number;
  roiPaid: boolean;
  payoutReference?: string;
  payoutRecipientCode?: string;
  paystackReference?: string;
  paystackAccessCode?: string;
  maturityDate?: Date;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;

  // Calculate projected return
  projectedReturn(): number;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    investor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: SUPPORTED_INVESTMENT_CURRENCIES,
      default: "NGN",
      required: true,
    },
    roi: { type: Number, required: true },
    roiPaid: { type: Boolean, default: false },
    payoutReference: { type: String },
    payoutRecipientCode: { type: String },
    paystackReference: { type: String },
    paystackAccessCode: { type: String },
    maturityDate: { type: Date },
    durationMonths: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

InvestmentSchema.index({ tenantId: 1, investor: 1, createdAt: -1 });
InvestmentSchema.index({ tenantId: 1, farm: 1, status: 1 });

// Method to calculate projected return
InvestmentSchema.methods.projectedReturn = function () {
  return this.amount + (this.amount * this.roi) / 100;
};

export const Investment = mongoose.model<IInvestment>(
  "Investment",
  InvestmentSchema,
);
