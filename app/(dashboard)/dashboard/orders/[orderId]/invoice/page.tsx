import { notFound } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth/guards"
import { getOrderById } from "@/lib/queries/order"
import { getPaymentMethodMeta } from "@/lib/payment/methods"
import { formatPrice } from "@/lib/utils"
import { InvoicePrintButton } from "./InvoicePrintButton"

export default async function InvoicePage({
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

  const dateFmt = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 print:py-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="text-sm text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined !text-base">arrow_back</span>
            Order details
          </Link>
          <InvoicePrintButton />
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 print:bg-white print:text-black print:border-black print:rounded-none">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary !text-3xl print:text-black">
                  bolt
                </span>
                <span className="text-2xl font-extrabold tracking-tight">Learnify</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 print:text-gray-600">
                learnify.example.com
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-extrabold tracking-tight">INVOICE</h1>
              <p className="text-xs text-on-surface-variant mt-1 font-mono print:text-gray-600">
                {order.id}
              </p>
            </div>
          </div>

          <div className="border-t border-outline-variant my-8 print:border-black" />

          {/* Bill to + meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 print:text-gray-600">
                Bill To
              </h2>
              <p className="font-bold text-on-surface">{order.user.name ?? "Customer"}</p>
              <p className="text-sm text-on-surface-variant print:text-gray-700">
                {order.user.email}
              </p>
            </div>
            <div className="md:text-right">
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 print:text-gray-600">
                Issue Date
              </h2>
              <p className="text-sm">{dateFmt(order.createdAt)}</p>
              {order.paidAt && (
                <>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-3 mb-2 print:text-gray-600">
                    Paid On
                  </h2>
                  <p className="text-sm">{dateFmt(order.paidAt)}</p>
                </>
              )}
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-3 mb-2 print:text-gray-600">
                Status
              </h2>
              <p className="text-sm font-bold">{order.status}</p>
            </div>
          </div>

          <div className="border-t border-outline-variant my-8 print:border-black" />

          {/* Line items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant print:border-black">
                <th className="text-left pb-3 font-bold">Description</th>
                <th className="text-right pb-3 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-variant print:border-gray-300">
                <td className="py-4">
                  <p className="font-bold">{order.course.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1 print:text-gray-600">
                    Course access (lifetime)
                  </p>
                </td>
                <td className="text-right py-4 font-mono">
                  {formatPrice(Number(order.amount))}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-6 text-right font-bold uppercase tracking-wider text-xs text-on-surface-variant print:text-gray-600">
                  Total
                </td>
                <td className="pt-6 text-right text-2xl font-extrabold font-mono">
                  {formatPrice(Number(order.amount))}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="border-t border-outline-variant my-8 print:border-black" />

          {/* Payment + footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 print:text-gray-600">
                Payment Method
              </h2>
              <p>{meta?.label ?? order.paymentMethod ?? "—"}</p>
              {order.paymentId && (
                <p className="text-xs font-mono text-on-surface-variant mt-1 print:text-gray-600">
                  Ref: {order.paymentId}
                </p>
              )}
            </div>
            <div className="md:text-right">
              <p className="text-xs text-on-surface-variant print:text-gray-600">
                Thank you for learning with Learnify.
              </p>
              <p className="text-xs text-on-surface-variant mt-1 print:text-gray-600">
                This is a system-generated invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
