import { EMAIL_FROM, EMAIL_PASS } from "../config/env";

type EmailTemplateOptions = {
  eyebrow?: string;
  title: string;
  intro: string;
  ctaLabel?: string;
  ctaUrl?: string;
  supportingCopy?: string[];
  notice?: string;
  footer?: string;
};

export function assertEmailConfig(): void {
  if (!EMAIL_PASS || !EMAIL_FROM) {
    throw new Error("Email service is not configured");
  }
}

export const renderEmailTemplate = ({
  eyebrow = "CropCapital",
  title,
  intro,
  ctaLabel,
  ctaUrl,
  supportingCopy = [],
  notice,
  footer = "CropCapital team",
}: EmailTemplateOptions): string => {
  const supportingHtml = supportingCopy
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.7;">${paragraph}</p>`,
    )
    .join("");

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 24px;">
          <tr>
            <td style="border-radius:999px;background:linear-gradient(135deg,#1f6d43 0%,#0f4a2f 100%);text-align:center;">
              <a href="${ctaUrl}" style="display:inline-block;padding:15px 24px;font-size:15px;font-weight:700;line-height:1;color:#fff8ec;text-decoration:none;">${ctaLabel}</a>
            </td>
          </tr>
        </table>`
      : "";

  const noticeHtml = notice
    ? `<div style="margin-top:24px;padding:16px 18px;border:1px solid #e6d7aa;border-radius:18px;background:#f8f3df;color:#6b4f13;font-size:14px;line-height:1.6;">${notice}</div>`
    : "";

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f1e7;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#163022;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f6f1e7;">
      <tr>
        <td style="padding:32px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e7dcc7;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(29,53,38,0.08);">
            <tr>
              <td style="padding:32px 32px 0;background:radial-gradient(circle at top left,#efe4bc 0%,#fffdf8 52%);">
                <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:#f3ecd2;color:#7b5a1d;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${eyebrow}</div>
                <h1 style="margin:22px 0 16px;font-size:40px;line-height:1.1;letter-spacing:-0.03em;color:#163022;">${title}</h1>
                <p style="margin:0;color:#385140;font-size:18px;line-height:1.7;">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 32px;">
                ${ctaHtml}
                ${supportingHtml}
                ${noticeHtml}
                <div style="margin-top:28px;padding-top:20px;border-top:1px solid #ece3d4;color:#64748b;font-size:13px;line-height:1.6;">
                  Sent by <strong style="color:#163022;">${footer}</strong>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

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
