import { USD_TO_IDR_RATE } from "../utils"
import { stripe } from "./client"

interface CreateSessionParams {
  orderId: string
  courseTitle: string
  amountInIDR: number
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateSessionParams) {
  const { orderId, courseTitle, amountInIDR, successUrl, cancelUrl } = params

  // Convert IDR to USD cents (Stripe requires smallest currency unit)
  const amountInUSDCents = Math.round((amountInIDR / USD_TO_IDR_RATE) * 100)

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountInUSDCents,
          product_data: {
            name: courseTitle,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

export async function retrieveSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId)
}