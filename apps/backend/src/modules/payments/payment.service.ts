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

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
  longcode?: string;
  gateway?: string;
  pay_with_bank?: boolean;
  active: boolean;
  is_deleted?: boolean;
  country?: string;
  currency?: string;
  type?: string;
}

interface PaystackBanksResponse {
  status: boolean;
  message: string;
  data: PaystackBank[];
}

interface PaystackCountry {
  id: number;
  active_for_dashboard_onboarding: boolean;
  name: string;
  iso_code: string;
  default_currency_code: string;
}

interface PaystackCountriesResponse {
  status: boolean;
  message: string;
  data: PaystackCountry[];
}

export interface SupportedPaystackCountry {
  id: number;
  name: string;
  isoCode: string;
  defaultCurrencyCode: string;
}

interface PaystackResolveAccountResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface ResolvedPaystackAccount {
  accountNumber: string;
  accountName: string;
  bankId: number;
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

export async function listBanks(country: string): Promise<PaystackBank[]> {
  const normalizedCountry = country.trim().toLowerCase();

  const searchParams = new URLSearchParams({
    country: normalizedCountry,
    perPage: "100",
  });

  const response = await fetch(`${PAYSTACK_BASE_URL}/bank?${searchParams}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    if (response.status >= 400 && response.status < 500) {
      return [];
    }

    throw new Error(error?.message || "Failed to fetch Paystack banks");
  }

  const payload = (await response.json()) as PaystackBanksResponse;

  return payload.data.filter((bank) => bank.active && !bank.is_deleted);
}

export async function listSupportedCountries(): Promise<
  SupportedPaystackCountry[]
> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/country`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Failed to fetch Paystack countries");
  }

  const payload = (await response.json()) as PaystackCountriesResponse;

  return payload.data
    .filter((country) => country.active_for_dashboard_onboarding)
    .map((country) => ({
      id: country.id,
      name: country.name,
      isoCode: country.iso_code,
      defaultCurrencyCode: country.default_currency_code,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function resolveAccountNumber(
  accountNumber: string,
  bankCode: string,
): Promise<ResolvedPaystackAccount | null> {
  const searchParams = new URLSearchParams({
    account_number: accountNumber.trim(),
    bank_code: bankCode.trim(),
  });

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/bank/resolve?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    if (response.status >= 400 && response.status < 500) {
      return null;
    }

    throw new Error(error?.message || "Failed to resolve bank account");
  }

  const payload = (await response.json()) as PaystackResolveAccountResponse;

  return {
    accountNumber: payload.data.account_number,
    accountName: payload.data.account_name,
    bankId: payload.data.bank_id,
  };
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
