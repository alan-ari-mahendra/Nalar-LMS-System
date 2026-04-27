import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth/guards"
import { getOrderById } from "@/lib/queries/order"
import { getPaymentMethodMeta } from "@/lib/payment/methods"
import { formatPrice } from "@/lib/utils"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const user = await requireAuth()
  const { orderId } = await params

  const order = await getOrderById(orderId)
  if (!order) notFound()

  const isOwner = order.user.id === user.id
  const isAdmin = user.role === "ADMIN"
  if (!isOwner && !isAdmin) notFound()

  const meta = getPaymentMethodMeta(order.paymentMethod)

  const reason =
    order.metadata && typeof order.metadata === "object" && "reason" in order.metadata
      ? String(order.metadata.reason)
      : null
  const refundReason =
    order.metadata && typeof order.metadata === "object" && "refundReason" in order.metadata
      ? String(order.metadata.refundReason)
      : null

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/orders"
          className="text-sm text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1 mb-3"
        >
          <span className="material-symbols-outlined !text-base">arrow_back</span>
          All orders
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Order Receipt</h1>
        <p className="text-on-surface-variant text-sm mt-1 font-mono">{order.id}</p>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden print:border-black">
        <div className="p-5 flex items-center gap-4 border-b border-outline-variant">
          <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0">
            <Image src={order.course.thumbnailUrl} alt={order.course.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant">Course</p>
            <p className="text-sm font-bold text-on-surface line-clamp-1">{order.course.title}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <dl className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <Field label="Amount" value={formatPrice(order.amount)} bold />
          <Field
            label="Payment method"
            value={
              <span className="inline-flex items-center gap-1.5">
                {meta && <span className="material-symbols-outlined !text-base">{meta.icon}</span>}
                {meta?.label ?? order.paymentMethod ?? "—"}
              </span>
            }
          />
          <Field
            label="Created"
            value={new Date(order.createdAt).toLocaleString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          {order.paidAt && (
            <Field
              label="Paid at"
              value={new Date(order.paidAt).toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          )}
          {order.paymentId && (
            <Field
              label="Payment reference"
              value={<span className="font-mono text-xs">{order.paymentId}</span>}
            />
          )}
          {order.refundedAt && (
            <Field
              label="Refunded at"
              value={new Date(order.refundedAt).toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          )}
          {isAdmin && (
            <Field
              label="Customer"
              value={
                <span>
                  {order.user.name}
                  <span className="block text-xs text-on-surface-variant">{order.user.email}</span>
                </span>
              }
            />
          )}
          {reason && order.status !== "REFUNDED" && (
            <div className="sm:col-span-2 bg-error-container/40 border border-error/20 rounded-lg p-3 text-sm text-on-error-container">
              <strong className="font-bold">Reason: </strong>
              {reason}
            </div>
          )}
          {refundReason && (
            <div className="sm:col-span-2 bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm text-on-surface-variant">
              <strong className="font-bold">Refund reason: </strong>
              {refundReason}
            </div>
          )}
        </dl>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        {order.status === "PENDING" && isOwner && (
          <Link
            href={`/checkout/order/${order.id}/pay`}
            className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold text-sm text-center hover:brightness-110 transition-all"
          >
            Resume Payment
          </Link>
        )}
        {order.status === "COMPLETED" && (
          <Link
            href={`/dashboard/courses`}
            className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold text-sm text-center hover:brightness-110 transition-all"
          >
            Go to My Courses
          </Link>
        )}
        <Link
          href={`/courses/${order.course.slug}`}
          className="flex-1 border border-outline-variant bg-surface-container-low py-3 rounded-lg font-bold text-sm text-on-surface text-center hover:bg-surface-container transition-all"
        >
          View Course
        </Link>
        {order.status === "COMPLETED" && (
          <Link
            href={`/dashboard/orders/${order.id}/invoice`}
            className="flex-1 border border-outline-variant bg-surface-container-low py-3 rounded-lg font-bold text-sm text-on-surface text-center hover:bg-surface-container transition-all"
          >
            View Invoice
          </Link>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  bold,
}: {
  label: string
  value: React.ReactNode
  bold?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{label}</dt>
      <dd className={`text-on-surface ${bold ? "font-bold text-base" : ""}`}>{value}</dd>
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
