import "server-only";

const BRAND = {
  green: "#93E030",
  navy: "#1B2242",
  ink: "#11130F",
  muted: "#667066",
  border: "#E3E8DE",
  surface: "#F4F7F0",
};

const LOGO_URL = "https://www.crypticsolutionsltd.com/cryptic-assets/fullLogoWhite.png";

interface EmailDetail {
  label: string;
  value: string;
}

interface EmailAction {
  label: string;
  href: string;
}

interface BrandedEmailOptions {
  preview: string;
  eyebrow: string;
  heading: string;
  greeting: string;
  paragraphs: string[];
  details?: EmailDetail[];
  callout?: string;
  action?: EmailAction;
  disclaimer?: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderBrandedEmail({
  preview,
  eyebrow,
  heading,
  greeting,
  paragraphs,
  details = [],
  callout,
  action,
  disclaimer = "You received this email because you applied to the Cryptic Partner Programme.",
}: BrandedEmailOptions) {
  const paragraphMarkup = paragraphs
    .map((paragraph) => `<p style="margin:0 0 16px;color:${BRAND.ink};font-size:16px;line-height:1.65;">${escapeHtml(paragraph)}</p>`)
    .join("");
  const detailMarkup = details.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-collapse:separate;border-spacing:0 8px;">${details
        .map(({ label, value }) => `<tr><td style="padding:14px 16px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:10px;"><div style="margin:0 0 4px;color:${BRAND.muted};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(label)}</div><div style="color:${BRAND.navy};font-size:16px;font-weight:700;line-height:1.45;word-break:break-word;">${escapeHtml(value)}</div></td></tr>`)
        .join("")}</table>`
    : "";
  const calloutMarkup = callout
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="padding:16px 18px;background:#F2F9E9;border-left:4px solid ${BRAND.green};border-radius:8px;color:${BRAND.ink};font-size:15px;line-height:1.6;">${escapeHtml(callout)}</td></tr></table>`
    : "";
  const actionMarkup = action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;"><tr><td bgcolor="${BRAND.green}" style="border-radius:9px;"><a href="${escapeHtml(action.href)}" style="display:inline-block;padding:14px 22px;color:${BRAND.ink};font-size:15px;font-weight:800;line-height:1;text-decoration:none;">${escapeHtml(action.label)} &nbsp;&#8594;</a></td></tr></table>`
    : "";
  const disclaimerMarkup = disclaimer
    ? `<p style="margin:14px 0 0;color:#9AA29A;font-size:12px;line-height:1.5;">${escapeHtml(disclaimer)}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#EEF1EC;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1EC;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(17,19,15,.08);">
            <tr>
              <td style="padding:22px 28px;background:${BRAND.ink};border-top:5px solid ${BRAND.green};">
                <img src="${LOGO_URL}" width="176" alt="Cryptic Solutions" style="display:block;width:176px;max-width:100%;height:auto;border:0;">
              </td>
            </tr>
            <tr>
              <td style="padding:36px 28px 32px;">
                <p style="margin:0 0 10px;color:#6D9F24;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0 0 24px;color:${BRAND.navy};font-size:28px;line-height:1.2;letter-spacing:-.02em;">${escapeHtml(heading)}</h1>
                <p style="margin:0 0 18px;color:${BRAND.ink};font-size:16px;line-height:1.6;">Hello ${escapeHtml(greeting)},</p>
                ${paragraphMarkup}
                ${detailMarkup}
                ${calloutMarkup}
                ${actionMarkup}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;background:${BRAND.navy};">
                <p style="margin:0;color:#FFFFFF;font-size:14px;font-weight:700;">Cryptic Solutions</p>
                <p style="margin:6px 0 0;color:#CAD0DF;font-size:13px;line-height:1.5;">Practical digital products for learning and work.</p>
                ${disclaimerMarkup}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
