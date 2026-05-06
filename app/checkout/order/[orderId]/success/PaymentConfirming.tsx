"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface PaymentConfirmingProps {
  orderId: string
}

const MAX_ATTEMPTS = 40
const POLL_INTERVAL_MS = 3000

export function PaymentConfirming({ orderId }: PaymentConfirmingProps) {
  const router = useRouter()
  const [attempt, setAttempt] = useState(0)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (attempt >= MAX_ATTEMPTS || timedOut) return

    const timer = setTimeout(() => {
      if (attempt + 1 >= MAX_ATTEMPTS) {
        setTimedOut(true)
        return
      }
      router.refresh()
      setAttempt((a) => a + 1)
    }, POLL_INTERVAL_MS)

    return () => clearTimeout(timer)
  }, [attempt, timedOut, router])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full flex flex-col items-center justify-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-6">
          {timedOut ? (
            <span className="material-symbols-outlined !text-5xl text-amber-400">
              schedule
            </span>
          ) : (
            <span className="material-symbols-outlined !text-5xl text-primary animate-spin">
              progress_activity
            </span>
          )}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2 text-center">
          {timedOut
            ? "Taking longer than expected"
            : "Confirming your payment..."}
        </h1>
        <p className="text-on-surface-variant text-center max-w-md mb-8">
          {timedOut
            ? "We haven't received confirmation from Stripe yet. Your payment may still be processing. Check your orders page for updates."
            : "We're waiting for payment confirmation from Stripe. This usually takes a few seconds."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {!timedOut && (
            <button
              onClick={() => {
                setAttempt(0)
                setTimedOut(false)
                router.refresh()
              }}
              className="px-5 py-2.5 border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container transition-all"
            >
              Check Again
            </button>
          )}
          <Link
            href="/dashboard/orders"
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm text-center hover:brightness-110 transition-all"
          >
            View Orders
          </Link>
        </div>
      </main>
    </div>
  )
}