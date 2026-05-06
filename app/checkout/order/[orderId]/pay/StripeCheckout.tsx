"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createStripeCheckoutSession } from "@/lib/actions/order"
import { formatPrice } from "@/lib/utils"

interface StripeCheckoutProps {
  order: {
    id: string
    amount: number
    course: {
      id: string
      title: string
      thumbnailUrl: string
    }
  }
}

export function StripeCheckout({ order }: StripeCheckoutProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handlePay() {
    setError("")
    startTransition(async () => {
      const result = await createStripeCheckoutSession({ orderId: order.id })
      if (result.success) {
        router.push(result.sessionUrl)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            <span className="font-bold tracking-tight text-on-surface">Learnify</span>
            <span className="ml-3 px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
              Secure Checkout
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            Order #{order.id.slice(-8)}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-5 flex items-center gap-4 border-b border-outline-variant">
            <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0">
              <Image
                src={order.course.thumbnailUrl}
                alt={order.course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-on-surface-variant">Paying for</p>
              <p className="text-sm font-bold text-on-surface truncate">
                {order.course.title}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-on-surface-variant">Total</p>
              <p className="text-base font-bold text-on-surface">
                {formatPrice(order.amount)}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined !text-2xl">credit_card</span>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Stripe Checkout</p>
                <p className="text-xs text-on-surface-variant">
                  You&apos;ll be redirected to Stripe to complete your payment securely.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 text-xs text-on-surface-variant flex gap-3">
              <span className="material-symbols-outlined text-tertiary !text-base shrink-0">lock</span>
              <p>
                Your payment is processed securely by Stripe. We never store your card details.
                Test mode is active — no real charges will be made.
              </p>
            </div>

            {error && (
              <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm flex items-center gap-2">
                <span className="material-symbols-outlined !text-base">error</span>
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/courses/${order.course.id}`}
                className="px-5 py-3 border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container transition-all text-center"
              >
                Cancel
              </Link>
              <button
                onClick={handlePay}
                disabled={isPending}
                className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="material-symbols-outlined !text-base animate-spin">
                      progress_activity
                    </span>
                    Creating session...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-lg">shopping_cart</span>
                    Pay with Stripe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-on-surface-variant">
          <Link href="/dashboard/orders" className="hover:text-primary">
            View all orders
          </Link>
        </div>
      </main>
    </div>
  )
}