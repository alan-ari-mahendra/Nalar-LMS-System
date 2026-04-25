import Link from "next/link"
import { requireAuth } from "@/lib/auth/guards"
import { getOrdersByUser } from "@/lib/queries/order"
import { getPaymentMethodMeta } from "@/lib/payment/methods"
import { formatPrice } from "@/lib/utils"
import type { OrderStatus } from "@prisma/client"

const STATUS_FILTERS: { value: "ALL" | OrderStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const user = await requireAuth()
  const { status } = await searchParams

  const validStatus =
    status && status !== "ALL"
      ? (["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)
          ? (status as OrderStatus)
          : undefined)
      : undefined

  const orders = await getOrdersByUser(user.id, { status: validStatus })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Orders</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          History of your course purchases.
        </p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const active = (status ?? "ALL") === f.value
          return (
            <Link
              key={f.value}
              href={f.value === "ALL" ? "/dashboard/orders" : `/dashboard/orders?status=${f.value}`}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                active
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">receipt_long</span>
          <p className="text-sm mb-6">No orders yet.</p>
          <Link
            href="/courses"
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:brightness-110 transition-all"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {orders.map((o) => {
                const meta = getPaymentMethodMeta(o.paymentMethod)
                return (
                  <tr key={o.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-on-surface line-clamp-1">
                        {o.course.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface whitespace-nowrap">
                      {formatPrice(o.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        {meta && (
                          <span className="material-symbols-outlined !text-base">{meta.icon}</span>
                        )}
                        {meta?.label ?? o.paymentMethod ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {o.status === "PENDING" ? (
                        <Link
                          href={`/checkout/order/${o.id}/pay`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          Resume
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cls = {
    COMPLETED: "bg-tertiary-container text-tertiary",
    PENDING: "bg-amber-500/20 text-amber-500",
    FAILED: "bg-error-container text-on-error-container",
    REFUNDED: "bg-secondary-container text-on-secondary-container",
  }[status]
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${cls}`}
    >
      {status}
    </span>
  )
}
