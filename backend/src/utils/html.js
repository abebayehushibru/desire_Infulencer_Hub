/**
 * Influencer Hub email template
 *
 * One shared, brand-styled shell for all transactional notifications —
 * auth (verification codes, password reset), registration/welcome,
 * and payment/withdrawal updates. Inline styles + table layout throughout,
 * since email clients strip <style> blocks and don't support flexbox/vars.
 *
 * @param {Object} params
 * @param {string} params.title    - Main heading, e.g. "Verify your account",
 *                                   "Welcome to Influencer Hub", "Payment received"
 * @param {string} [params.eyebrow]- Small label above the title, e.g. "Account Security",
 *                                   "Registration", "Payment Update". Defaults to "Influencer Hub".
 * @param {string} [params.name]   - Recipient's display name
 * @param {string} [params.email]  - Recipient's email (shown for confirmation + footer)
 * @param {string} [params.message]- Body paragraph under the title
 * @param {string} [params.code]   - Optional verification/confirmation code, shown large
 * @param {Array<{label:string,value:string}>} [params.details]
 *                                 - Optional key/value rows, e.g. payment amount, date, status
 * @param {string} [params.info]  - Optional highlighted note (expiry, disclaimer, etc.)
 * @param {string} [params.ctaText] - Optional button label, e.g. "View Dashboard"
 * @param {string} [params.ctaUrl]  - Optional button link
 * @returns {string} HTML string ready to pass as `html` to sendEmail()
 */
const influencerEmailTemplate = ({
  title,
  eyebrow = "Influencer Hub",
  name,
  email,
  message,
  code,
  details,
  info,
  ctaText,
  ctaUrl,
}) => {
  const primary = "#16115A"; // deep navy
  const secondary = "#2E1C8D"; // purple
  const accent = "#FEB209"; // gold
  const year = new Date().getFullYear();

  const detailsRows = Array.isArray(details) && details.length
    ? details
        .map(
          (d, i) => `
        <tr>
          <td style="padding:12px 0; border-top:1px solid #EDEBFB; font-size:13px; color:#6B7280;">
            ${d.label}
          </td>
          <td style="padding:12px 0; border-top:1px solid #EDEBFB; font-size:13px; font-weight:600; color:#1F2937; text-align:right;">
            ${d.value}
          </td>
        </tr>`
        )
        .join("")
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || "Influencer Hub"}</title>
</head>
<body style="margin:0; padding:0; background-color:#F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(22,17,90,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${primary}, ${secondary}); padding:36px 32px 30px 32px;" bgcolor="${primary}">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 10px 0; font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:${accent};">
                      ${eyebrow}
                    </p>
                    <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; color:#FFFFFF;">
                      ${title || "Notification"}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent divider -->
          <tr>
            <td style="height:4px; background:linear-gradient(90deg, ${accent}, ${secondary});"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${
                name
                  ? `<p style="margin:0 0 4px 0; font-size:15px; color:#111827;">Hi ${name},</p>`
                  : ""
              }

              ${
                message
                  ? `<p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#6B7280;">${message}</p>`
                  : ""
              }

              ${
                code
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center" style="background-color:#F5F3FF; border-radius:12px; padding:24px; border:1px solid #EDEBFB;">
                          <p style="margin:0 0 8px 0; font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:${secondary};">
                            Your Code
                          </p>
                          <p style="margin:0; font-size:32px; font-weight:700; letter-spacing:0.2em; color:${primary};">
                            ${code}
                          </p>
                          <div style="margin:12px auto 0 auto; width:40px; height:3px; background-color:${accent}; border-radius:2px;"></div>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }

              ${
                detailsRows
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      ${detailsRows}
                    </table>`
                  : ""
              }

              ${
                ctaText && ctaUrl
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${ctaUrl}" target="_blank" style="display:inline-block; background-color:${accent}; color:${primary}; font-size:14px; font-weight:700; text-decoration:none; padding:13px 32px; border-radius:10px;">
                            ${ctaText}
                          </a>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }

              ${
                info
                  ? `<p style="margin:0 0 24px 0; font-size:13px; line-height:1.6; color:#92620A; background-color:#FFF7E6; border:1px solid ${accent}; border-radius:8px; padding:12px 14px;">
                      ${info}
                    </p>`
                  : ""
              }

              <p style="margin:0; font-size:13px; line-height:1.6; color:#9CA3AF;">
                Didn't expect this email? You can safely ignore it — no changes were made to your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#FAFAFB; border-top:1px solid #F3F4F6;">
              <p style="margin:0; font-size:12px; color:#9CA3AF; text-align:center;">
                ${email ? `Sent to ${email} · ` : ""}© ${year} Influencer Hub. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports = { influencerEmailTemplate };