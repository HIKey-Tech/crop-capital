import mongoose, { Schema, Document } from "mongoose";

export type KycDocumentType = "passport" | "national_id" | "drivers_license";
export type KycStatus = "pending" | "approved" | "rejected";

export interface IKycDocument extends Document {
  tenantId?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  documentType: KycDocumentType;
  documentImage: string;
  documentImagePublicId: string;
  selfieImage?: string;
  selfieImagePublicId?: string;
  status: KycStatus;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KycDocumentSchema = new Schema<IKycDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    documentType: {
      type: String,
      enum: ["passport", "national_id", "drivers_license"],
      required: true,
    },
    documentImage: { type: String, required: true },
    documentImagePublicId: { type: String, required: true },
    selfieImage: { type: String },
    selfieImagePublicId: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

// Ensure only one active KYC submission per user (pending or approved)
KycDocumentSchema.index({ user: 1, status: 1 });
KycDocumentSchema.index({ tenantId: 1, user: 1, createdAt: -1 });

export const KycDocument = mongoose.model<IKycDocument>(
  "KycDocument",
  KycDocumentSchema,
);
