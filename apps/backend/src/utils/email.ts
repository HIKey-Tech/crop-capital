import { EMAIL_FROM, EMAIL_PASS } from "../config/env";

export function assertEmailConfig(): void {
  if (!EMAIL_PASS || !EMAIL_FROM) {
    throw new Error("Email service is not configured");
  }
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  assertEmailConfig();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${EMAIL_PASS}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `CropCapital <${EMAIL_FROM}>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
      name?: string;
    } | null;
    throw new Error(
      data?.message || data?.error || data?.name || "Email delivery failed",
    );
  }
};
