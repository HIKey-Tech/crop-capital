import mongoose, { Schema, Document } from "mongoose";

export type ActivityType =
  | "user_signup"
  | "tenant_created"
  | "tenant_updated"
  | "tenant_deleted"
  | "farm_created"
  | "farm_updated"
  | "farm_deleted"
  | "investment_created"
  | "investment_completed"
  | "investment_failed"
  | "kyc_submitted"
  | "kyc_approved"
  | "kyc_rejected"
  | "roi_paid"
  | "user_promoted_to_admin"
  | "user_demoted_to_investor";

export interface IActivity extends Document {
  tenantId?: mongoose.Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  /** The user who triggered or is the subject of the activity */
  actor?: mongoose.Types.ObjectId;
  /** Optional related resource (farm, investment, etc.) */
  resourceId?: mongoose.Types.ObjectId;
  resourceType?: "Farm" | "Investment" | "User" | "KycDocument" | "Tenant";
  /** Arbitrary extra data (amounts, names, etc.) */
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "user_signup",
        "tenant_created",
        "tenant_updated",
        "tenant_deleted",
        "farm_created",
        "farm_updated",
        "farm_deleted",
        "investment_created",
        "investment_completed",
        "investment_failed",
        "kyc_submitted",
        "kyc_approved",
        "kyc_rejected",
        "roi_paid",
        "user_promoted_to_admin",
        "user_demoted_to_investor",
      ],
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", index: true },
    resourceId: { type: Schema.Types.ObjectId },
    resourceType: {
      type: String,
      enum: ["Farm", "Investment", "User", "KycDocument", "Tenant"],
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Compound index for efficient querying: newest first, filterable by type
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });
ActivitySchema.index({ tenantId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>("Activity", ActivitySchema);
