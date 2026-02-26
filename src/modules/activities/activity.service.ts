import mongoose from "mongoose";
import { Activity, ActivityType } from "./activity.model";

interface LogActivityParams {
  type: ActivityType;
  title: string;
  description: string;
  tenantId?: string | mongoose.Types.ObjectId;
  actor?: string | mongoose.Types.ObjectId;
  resourceId?: string | mongoose.Types.ObjectId;
  resourceType?: "Farm" | "Investment" | "User" | "KycDocument";
  metadata?: Record<string, unknown>;
}

/**
 * Log a platform activity. This is fire-and-forget — it will never
 * throw or block the caller. Errors are logged to console.
 */
export function logActivity(params: LogActivityParams): void {
  Activity.create({
    type: params.type,
    title: params.title,
    description: params.description,
    tenantId: params.tenantId
      ? new mongoose.Types.ObjectId(String(params.tenantId))
      : undefined,
    actor: params.actor
      ? new mongoose.Types.ObjectId(String(params.actor))
      : undefined,
    resourceId: params.resourceId
      ? new mongoose.Types.ObjectId(String(params.resourceId))
      : undefined,
    resourceType: params.resourceType,
    metadata: params.metadata,
  }).catch((err) => {
    console.error("[Activity] Failed to log activity:", err.message);
  });
}
