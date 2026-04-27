type PasswordResetArgs = {
  name: string
  resetUrl: string
}

export function buildPasswordResetEmail({ name, resetUrl }: PasswordResetArgs) {
  const subject = "Reset your Learnify password"

  const text = `Hi ${name},

We received a request to reset your Learnify password. Click the link below to set a new password:

${resetUrl}

This link expires in 1 hour and can only be used once.

If you did not request a password reset, ignore this email — your password will remain unchanged.

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
                <h1 style="margin:0;font-size:24px;font-weight:700;color:#fafafa;">Reset your password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                Hi ${escapeHtml(name)}, we received a request to reset your password. Click the button below to set a new one.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="${resetUrl}" style="display:inline-block;background:#a78bfa;color:#0a0012;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;">Reset Password</a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:16px;color:#71717a;font-size:13px;line-height:1.6;">
                Or copy this link into your browser:<br>
                <span style="color:#a78bfa;word-break:break-all;">${resetUrl}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;border-top:1px solid #27272a;color:#71717a;font-size:12px;line-height:1.6;">
                This link expires in 1 hour and can only be used once. If you did not request a reset, ignore this email — your password will not change.
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
