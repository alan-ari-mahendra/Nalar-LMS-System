type VerifyEmailArgs = {
  name: string
  verifyUrl: string
}

export function buildVerifyEmail({ name, verifyUrl }: VerifyEmailArgs) {
  const subject = "Verify your Learnify email"

  const text = `Hi ${name},

Welcome to Learnify! Please verify your email address by clicking the link below:

${verifyUrl}

This link expires in 24 hours.

If you did not sign up for Learnify, you can safely ignore this email.

— The Learnify Team`

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#09090b;font-family:Geist,system-ui,sans-serif;color:#fafafa;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121215;border:1px solid #27272a;border-radius:12px;padding:40px;">
            <tr>
              <td style="padding-bottom:24px;">
                <span style="font-size:24px;font-weight:800;letter-spacing:-0.04em;color:#fafafa;">Learnify</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:16px;">
                <h1 style="margin:0;font-size:24px;font-weight:700;color:#fafafa;">Verify your email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                Hi ${escapeHtml(name)}, welcome to Learnify. Click the button below to verify your email address.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="${verifyUrl}" style="display:inline-block;background:#a78bfa;color:#0a0012;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;">Verify Email</a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:16px;color:#71717a;font-size:13px;line-height:1.6;">
                Or copy this link into your browser:<br>
                <span style="color:#a78bfa;word-break:break-all;">${verifyUrl}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;border-top:1px solid #27272a;color:#71717a;font-size:12px;line-height:1.6;">
                This link expires in 24 hours. If you did not sign up for Learnify, ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, html, text }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
