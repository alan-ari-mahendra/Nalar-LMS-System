"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Avatar } from "@/components/shared/Avatar"
import { refundOrder } from "@/lib/actions/order"
import { getPaymentMethodMeta } from "@/lib/payment/methods"
import { formatPrice } from "@/lib/utils"
import type { AdminOrderRow } from "@/lib/queries/order"

const STATUS_FILTERS = ["ALL", "PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const

interface AdminOrdersClientProps {
  orders: AdminOrderRow[]
  initialStatus: string
  initialQuery: string
}

export function AdminOrdersClient({ orders, initialStatus, initialQuery }: AdminOrdersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [refundTarget, setRefundTarget] = useState<AdminOrderRow | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) params.set("q", query.trim())
    else params.delete("q")
    router.push(`/dashboard/admin/orders?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">All Orders</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Manage and refund customer orders.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline !text-lg">
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID, paymentId, name, or email..."
            className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => {
            const active = initialStatus === s
            const params = new URLSearchParams(searchParams.toString())
            if (s === "ALL") params.delete("status")
            else params.set("status", s)
            return (
              <Link
                key={s}
                href={`/dashboard/admin/orders?${params.toString()}`}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  active
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {s === "ALL" ? "All" : s}
              </Link>
            )
          })}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">receipt_long</span>
          <p className="text-sm">No orders match your filters.</p>
        </div>
      ) : (
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {orders.map((o) => {
                const meta = getPaymentMethodMeta(o.paymentMethod)
                return (
                  <tr key={o.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={o.user.avatarUrl} name={o.user.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{o.user.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{o.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface line-clamp-1 max-w-xs">
                      {o.course.title}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface whitespace-nowrap">
                      {formatPrice(o.amount)}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                      {meta?.label ?? o.paymentMethod ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="text-on-surface-variant hover:text-primary"
                          title="View"
                        >
                          <span className="material-symbols-outlined !text-lg">visibility</span>
                        </Link>
                        {o.status === "COMPLETED" && (
                          <button
                            onClick={() => setRefundTarget(o)}
                            className="text-on-surface-variant hover:text-error"
                            title="Refund"
                          >
                            <span className="material-symbols-outlined !text-lg">currency_exchange</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {refundTarget && (
        <RefundModal order={refundTarget} onClose={() => setRefundTarget(null)} />
      )}
    </div>
  )
}

function RefundModal({ order, onClose }: { order: AdminOrderRow; onClose: () => void }) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await refundOrder({ orderId: order.id, reason })
      if (result.success) {
        onClose()
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-surface-container border border-outline-variant rounded-xl max-w-md w-full p-6 space-y-5">
        <header>
          <h2 className="text-lg font-bold text-on-surface">Refund order</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Refund {formatPrice(order.amount)} to {order.user.name}? Student access to the course will be preserved.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-sm font-medium text-on-surface">
              Reason (min 5 chars)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={5}
              maxLength={500}
              rows={3}
              placeholder="Explain why this is being refunded..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {error && (
            <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 border border-outline-variant bg-surface-container-low text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-error text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isPending ? "Processing..." : "Confirm Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const cls =
    {
      COMPLETED: "bg-tertiary-container text-tertiary",
      PENDING: "bg-amber-500/20 text-amber-500",
      FAILED: "bg-error-container text-on-error-container",
      REFUNDED: "bg-secondary-container text-on-secondary-container",
    }[status] ?? "bg-surface-container-high text-on-surface-variant"
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${cls}`}
    >
      {status}
    </span>
  )
}
