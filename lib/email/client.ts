import { Resend } from "resend"

const DEFAULT_FROM = "Learnify <onboarding@resend.dev>"

let cachedClient: Resend | null = null

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!cachedClient) cachedClient = new Resend(apiKey)
  return cachedClient
}

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
  const client = getClient()
  if (!client) {
    console.warn("[email] RESEND_API_KEY missing — skipping send")
    return { success: false, error: "Email service not configured" }
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_FROM

  try {
    const result = await client.emails.send({ from, to, subject, html, text })
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
