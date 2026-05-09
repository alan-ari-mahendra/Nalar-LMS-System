import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { prisma } from "@/lib/db"
import { createEnrollmentTx } from "@/lib/server/enrollment-helpers"

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[Stripe Webhook] Signature verification failed:", message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const orderId = session.metadata?.orderId as string | undefined

    if (!orderId) {
      console.error("[Stripe Webhook] No orderId in session metadata")
      return NextResponse.json({ received: true })
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          courseId: true,
          status: true,
          couponId: true,
          course: { select: { title: true } },
        },
      })

      if (!order || order.status !== "PENDING") {
        // Idempotent: already processed or invalid — return 200 to acknowledge
        return NextResponse.json({ received: true })
      }

      await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: orderId, status: "PENDING" },
          data: {
            status: "COMPLETED",
            paidAt: new Date(),
            paymentId: session.id,
            metadata: {
              stripe: true,
              sessionId: session.id,
              paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
              confirmedAt: new Date().toISOString(),
            },
          },
          select: { couponId: true },
        })

        // Increment coupon usage if applicable
        if (updated.couponId) {
          await tx.coupon.update({
            where: { id: updated.couponId },
            data: { usedCount: { increment: 1 } },
          })
        }

        // Create enrollment (defensive: skip if already exists)
        const existingEnrollment = await tx.enrollment.findUnique({
          where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
          select: { id: true },
        })
        if (!existingEnrollment) {
          await createEnrollmentTx(tx, {
            userId: order.userId,
            courseId: order.courseId,
            courseTitle: order.course.title,
          })
        }
      })

      console.log(`[Stripe Webhook] Order ${orderId} marked as COMPLETED`)
    } catch (err) {
      console.error(`[Stripe Webhook] Error processing order ${orderId}:`, err)
      // Return 500 so Stripe retries
      return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}