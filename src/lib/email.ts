import nodemailer from "nodemailer";

interface SendPasswordResetEmailParams {
  toEmail: string;
  resetUrl: string;
}

// In-memory record for testing purposes in development / staging
let lastTestingResetLink: { toEmail: string; resetUrl: string; timestamp: number } | null = null;

export function getLastResetLinkForTesting() {
  return lastTestingResetLink;
}

/**
 * Sends a password reset email via configured server-side provider.
 * Supports SMTP (via nodemailer) and Resend API.
 * Never logs credentials, tokens, or passwords.
 */
export async function sendPasswordResetEmail({
  toEmail,
  resetUrl,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  // Save for testing verification
  lastTestingResetLink = {
    toEmail,
    resetUrl,
    timestamp: Date.now(),
  };

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"LingoAI" <no-reply@lingoai.com>';

  const subject = "Reset Your LingoAI Password";
  const textContent = `Hello,\n\nYou recently requested to reset your password for your LingoAI account.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not make this request, you can safely ignore this email.\n\nBest regards,\nThe LingoAI Team`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 40px 24px; text-align: center; background: linear-gradient(135deg, #1e296c 0%, #2e3a8c 100%);">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                      Lingo<span style="color: #60a5fa;">AI</span>
                    </h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 40px 32px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">
                      Reset Your Password
                    </h2>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #475569;">
                      We received a request to reset the password for your LingoAI account. Tap the button below to choose a new password:
                    </p>
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px;">
                      <tr>
                        <td align="center" style="border-radius: 9999px; background-color: #2e3a8c;">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 16px; font-size: 13px; line-height: 20px; color: #64748b;">
                      This link will expire in <strong>1 hour</strong>.
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #94a3b8;">
                      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                    &copy; ${new Date().getFullYear()} LingoAI. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // 1. Try SMTP if configured
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return { success: true };
    } catch (err: any) {
      console.error("[Email Service] SMTP dispatch error:", err.message);
      return { success: false, error: "Failed to send email via SMTP" };
    }
  }

  // 2. Try Resend if configured
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        console.error("[Email Service] Resend API error status:", res.status);
        return { success: false, error: "Failed to send email via Resend" };
      }

      return { success: true };
    } catch (err: any) {
      console.error("[Email Service] Resend fetch error:", err.message);
      return { success: false, error: "Failed to communicate with email provider" };
    }
  }

  // 3. Development / Local Fallback
  // Obfuscate email for safe logging (e.g., 1a***@gmail.com)
  const [userPart, domainPart] = toEmail.split("@");
  const obfuscatedEmail = userPart && domainPart && userPart.length > 2 
    ? `${userPart.slice(0, 2)}***@${domainPart}` 
    : `***@${domainPart || "email"}`;

  console.log(`[Email Service] Development Mode: Password reset prepared for ${obfuscatedEmail}. (To send real emails, configure SMTP_HOST, SMTP_USER, SMTP_PASS or RESEND_API_KEY in .env)`);

  return { success: true };
}
