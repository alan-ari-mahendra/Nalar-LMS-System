"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createOrder } from "@/lib/actions/order"
import { validateCoupon } from "@/lib/actions/coupon"
import { PAYMENT_METHODS } from "@/lib/payment/methods"
import { formatPrice } from "@/lib/utils"
import type { PaymentMethod } from "@/lib/actions/schemas"

interface CheckoutClientProps {
  courseId: string
  courseSlug: string
  coursePrice: number
}

type AppliedCoupon = {
  code: string
  discountPercent: number
  discountAmount: number
  finalAmount: number
}

export function CheckoutClient({ courseId, courseSlug, coursePrice }: CheckoutClientProps) {
  const router = useRouter()
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const [couponInput, setCouponInput] = useState("")
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState("")
  const [isValidating, startValidate] = useTransition()

  function applyCoupon() {
    setCouponError("")
    if (!couponInput.trim()) return
    startValidate(async () => {
      const result = await validateCoupon({ code: couponInput.trim().toUpperCase(), courseId })
      if (!result.success) {
        setCouponError(result.error)
        setCoupon(null)
        return
      }
      setCoupon({
        code: result.code,
        discountPercent: result.discountPercent,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
      })
    })
  }

  function clearCoupon() {
    setCoupon(null)
    setCouponInput("")
    setCouponError("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await createOrder({
        courseId,
        paymentMethod: method,
        couponCode: coupon?.code,
      })
      if (result.success) {
        router.push(`/checkout/order/${result.orderId}/pay`)
      } else {
        setError(result.error)
      }
    })
  }

  const finalAmount = coupon?.finalAmount ?? coursePrice

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-6"
    >
      <div>
        <h2 className="text-lg font-bold text-on-surface mb-1">Payment method</h2>
        <p className="text-xs text-on-surface-variant">Pick how you&apos;d like to pay.</p>
      </div>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((m) => {
          const active = method === m.value
          return (
            <label
              key={m.value}
              className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-container-low hover:border-outline"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={m.value}
                checked={active}
                onChange={() => setMethod(m.value)}
                className="sr-only"
              />
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? "bg-primary/15 text-primary" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined !text-xl">{m.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">{m.label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{m.description}</p>
              </div>
              <span
                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  active ? "border-primary bg-primary" : "border-outline-variant"
                }`}
              >
                {active && (
                  <span className="material-symbols-outlined !text-sm text-on-primary">check</span>
                )}
              </span>
            </label>
          )
        })}
      </div>

      <div className="border-t border-outline-variant pt-5 space-y-3">
        <h3 className="text-sm font-bold">Coupon Code</h3>
        {coupon ? (
          <div className="bg-tertiary-container/30 border border-tertiary/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-tertiary">
                {coupon.code} — {coupon.discountPercent}% off
              </p>
              <p className="text-xs text-on-surface-variant">
                Saved {formatPrice(coupon.discountAmount)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearCoupon}
              className="text-xs text-on-surface-variant hover:text-error"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={isValidating || !couponInput.trim()}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {isValidating ? "Checking..." : "Apply"}
            </button>
          </div>
        )}
        {couponError && (
          <p className="text-xs text-error flex items-center gap-1">
            <span className="material-symbols-outlined !text-sm">error</span>
            {couponError}
          </p>
        )}
      </div>

      <div className="border-t border-outline-variant pt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className="font-mono">{formatPrice(coursePrice)}</span>
        </div>
        {coupon && (
          <div className="flex items-center justify-between text-sm text-tertiary">
            <span>Discount ({coupon.discountPercent}%)</span>
            <span className="font-mono">-{formatPrice(coupon.discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
          <span className="font-bold">Total</span>
          <span className="font-bold text-lg font-mono">{formatPrice(finalAmount)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push(`/courses/${courseSlug}`)}
          className="px-5 py-2.5 border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Processing..." : "Continue to Payment"}
        </button>
      </div>
    </form>
  )
}
