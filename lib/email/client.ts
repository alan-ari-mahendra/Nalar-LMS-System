import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM ?? "Learnify <onboarding@resend.dev>"

if (!apiKey) {
  console.warn("[email] RESEND_API_KEY missing — email sends will fail")
}

const resend = new Resend(apiKey ?? "")

type SendArgs = {
  to: string
  subject: string
  html: string
  text: string
}

type SendResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<SendResult> {
  if (!apiKey) {
    return { success: false, error: "Email service not configured" }
  }

  try {
    const result = await resend.emails.send({ from, to, subject, html, text })
    if (result.error) {
      console.error("[email] send failed", result.error)
      return { success: false, error: result.error.message }
    }
    return { success: true, id: result.data?.id ?? "" }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error"
    console.error("[email] send threw", err)
    return { success: false, error: message }
  }
}
