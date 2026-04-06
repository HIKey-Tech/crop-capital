import crypto from "crypto";
import { PAYSTACK_SECRET_KEY } from "@/config/env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    created_at: string;
    metadata: Record<string, unknown>;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

/**
 * Generate a unique transaction reference
 */
export function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(8).toString("hex");
  return `CC-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Initialize a Paystack transaction
 * @param email - Customer's email address
 * @param amount - Amount in the main currency unit (e.g., Naira, not kobo)
 * @param metadata - Additional data to attach to the transaction
 * @param currency - Transaction currency (defaults to NGN)
 * @param callbackUrl - URL to redirect after payment
 */
export async function initializeTransaction(
  email: string,
  amount: number,
  metadata: Record<string, unknown> = {},
  currency = "NGN",
  callbackUrl: string,
): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Paystack expects kobo (subunit)
      currency,
      reference: generateReference(),
      callback_url: callbackUrl,
      metadata,
      channels: ["card", "bank", "ussd", "bank_transfer"],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Failed to initialize Paystack transaction",
    );
  }

  return response.json();
}

/**
 * Verify a Paystack transaction
 * @param reference - Transaction reference
 */
export async function verifyTransaction(
  reference: string,
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify Paystack transaction");
  }

  return response.json();
}

/**
 * Validate Paystack webhook signature
 * @param payload - Raw request body (string)
 * @param signature - x-paystack-signature header value
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
