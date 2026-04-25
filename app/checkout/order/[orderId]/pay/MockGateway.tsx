"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { mockConfirmPayment, mockFailPayment, cancelOrder } from "@/lib/actions/order"
import { formatPrice } from "@/lib/utils"
import type { PaymentMethodMeta } from "@/lib/payment/methods"

interface MockGatewayProps {
  order: {
    id: string
    amount: number
    paymentMethod: string | null
    course: {
      id: string
      title: string
      thumbnailUrl: string
    }
  }
  methodMeta: PaymentMethodMeta | null
}

export function MockGateway({ order, methodMeta }: MockGatewayProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const simulateFail = searchParams.get("simulate") === "fail"
  const [isProcessing, startProcessing] = useTransition()
  const [isCancelling, startCancel] = useTransition()
  const [error, setError] = useState("")

  function handleConfirm() {
    setError("")
    startProcessing(async () => {
      await new Promise((r) => setTimeout(r, 2000))
      const action = simulateFail ? mockFailPayment : mockConfirmPayment
      const result = await action({ orderId: order.id })
      if (result.success) {
        router.push(`/checkout/order/${order.id}/${simulateFail ? "failed" : "success"}`)
      } else {
        setError(result.error)
      }
    })
  }

  function handleCancel() {
    setError("")
    startCancel(async () => {
      const result = await cancelOrder({ orderId: order.id })
      if (result.success) {
        router.push(`/courses`)
      } else {
        setError(result.error)
      }
    })
  }

  const fakeVA = `8800${order.id.slice(-10).toUpperCase()}`

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            <span className="font-bold tracking-tight text-on-surface">Learnify</span>
            <span className="ml-3 px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded">
              Mock Gateway
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            Order #{order.id.slice(-8)}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          {/* Course header */}
          <div className="p-5 flex items-center gap-4 border-b border-outline-variant">
            <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0">
              <Image src={order.course.thumbnailUrl} alt={order.course.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-on-surface-variant">Paying for</p>
              <p className="text-sm font-bold text-on-surface truncate">{order.course.title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-on-surface-variant">Total</p>
              <p className="text-base font-bold text-on-surface">{formatPrice(order.amount)}</p>
            </div>
          </div>

          {/* Method-specific pseudo-UI */}
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined !text-2xl">{methodMeta?.icon ?? "payments"}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{methodMeta?.label ?? "Payment"}</p>
                <p className="text-xs text-on-surface-variant">{methodMeta?.description ?? ""}</p>
              </div>
            </div>

            <MethodPseudoUi method={order.paymentMethod} amount={order.amount} fakeVA={fakeVA} />

            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 text-xs text-on-surface-variant flex gap-3">
              <span className="material-symbols-outlined text-amber-500 !text-base shrink-0">info</span>
              <p>
                This is a simulated gateway for demo purposes only. Click <strong>Confirm Payment</strong>
                {" "}to mark the order as paid. No real money is charged.
                {simulateFail && (
                  <> <strong className="text-error">Simulate fail mode is active</strong> — confirming will mark this as FAILED.</>
                )}
              </p>
            </div>

            {error && (
              <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancel}
                disabled={isProcessing || isCancelling}
                className="px-5 py-3 border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing || isCancelling}
                className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined !text-base animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    {simulateFail ? "Confirm (Will Fail)" : "Confirm Payment"}
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
          {" · "}
          <Link
            href={simulateFail ? `?` : `?simulate=fail`}
            className="hover:text-primary"
            replace
          >
            {simulateFail ? "Disable fail simulation" : "Simulate failure"}
          </Link>
        </div>
      </main>
    </div>
  )
}

function MethodPseudoUi({
  method,
  amount,
  fakeVA,
}: {
  method: string | null
  amount: number
  fakeVA: string
}) {
  if (method === "BANK_TRANSFER") {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-5 space-y-3">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Virtual Account</p>
        <p className="text-2xl font-mono font-bold text-on-surface">{fakeVA}</p>
        <p className="text-xs text-on-surface-variant">
          Transfer exactly <span className="text-on-surface font-bold">Rp {amount.toLocaleString("id-ID")}</span> to the VA above. Demo only.
        </p>
      </div>
    )
  }

  if (method === "QRIS") {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-5 flex items-center gap-5">
        <div className="w-32 h-32 bg-on-surface flex items-center justify-center rounded-lg shrink-0">
          <span className="material-symbols-outlined !text-6xl text-background">qr_code_2</span>
        </div>
        <div className="text-xs text-on-surface-variant space-y-1">
          <p className="text-on-surface font-bold text-sm">Scan to pay</p>
          <p>Open any QRIS-supported app (GoPay, OVO, Dana, ShopeePay, BCA Mobile, etc.) and scan this code.</p>
          <p className="font-mono text-[10px] text-outline mt-2">DEMO-QR-{fakeVA}</p>
        </div>
      </div>
    )
  }

  if (method === "GOPAY" || method === "OVO") {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-5 space-y-2">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Push notification sent</p>
        <p className="text-sm text-on-surface">
          Open your {method === "GOPAY" ? "GoPay" : "OVO"} app to approve the payment of{" "}
          <span className="font-bold">Rp {amount.toLocaleString("id-ID")}</span>.
        </p>
      </div>
    )
  }

  if (method === "CREDIT_CARD") {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-5 space-y-3">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Card details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="•••• •••• •••• 4242"
              disabled
              className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 text-sm font-mono"
            />
          </div>
          <input
            type="text"
            placeholder="MM / YY"
            disabled
            className="bg-surface-container border border-outline-variant rounded px-3 py-2 text-sm font-mono"
          />
          <input
            type="text"
            placeholder="CVC"
            disabled
            className="bg-surface-container border border-outline-variant rounded px-3 py-2 text-sm font-mono"
          />
        </div>
        <p className="text-[11px] text-on-surface-variant">3DS challenge will be simulated.</p>
      </div>
    )
  }

  return null
}
