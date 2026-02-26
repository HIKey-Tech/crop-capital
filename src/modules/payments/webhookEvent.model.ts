import { Schema, model, Document } from "mongoose";

interface IWebhookEvent extends Document {
  paystackEventId: string;
  eventType: string;
  tenantId?: string;
  processedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  paystackEventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  tenantId: { type: String, index: true },
  processedAt: { type: Date, default: Date.now },
});

export const WebhookEvent = model<IWebhookEvent>(
  "WebhookEvent",
  WebhookEventSchema,
);
