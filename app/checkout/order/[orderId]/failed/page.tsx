import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/guards"
import { getOrderById } from "@/lib/queries/order"
import { formatPrice } from "@/lib/utils"

export default async function FailedPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const user = await requireAuth()
  const { orderId } = await params

  const order = await getOrderById(orderId)
  if (!order || order.user.id !== user.id) notFound()

  if (order.status === "PENDING") {
    redirect(`/checkout/order/${orderId}/pay`)
  }
  if (order.status === "COMPLETED") {
    redirect(`/checkout/order/${orderId}/success`)
  }

  const reason =
    (order.metadata && typeof order.metadata === "object" && "reason" in order.metadata
      ? String(order.metadata.reason)
      : null) ?? "Payment did not complete."

  const isRefunded = order.status === "REFUNDED"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-error/15 border border-error/30 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined !text-5xl text-error">
              {isRefunded ? "currency_exchange" : "cancel"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            {isRefunded ? "Order refunded" : "Payment failed"}
          </h1>
          <p className="text-on-surface-variant">{reason}</p>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Course</span>
            <span className="text-on-surface font-bold line-clamp-1 max-w-[60%] text-right">{order.course.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Amount</span>
            <span className="text-on-surface">{formatPrice(order.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Order ID</span>
            <span className="font-mono text-xs text-on-surface">{order.id}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isRefunded && (
            <Link
              href={`/checkout/course/${order.course.id}`}
              className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold text-sm text-center hover:brightness-110 transition-all"
            >
              Try Again
            </Link>
          )}
          <Link
            href={`/courses/${order.course.slug}`}
            className="flex-1 border border-outline-variant bg-surface-container-low py-3 rounded-lg font-bold text-sm text-on-surface text-center hover:bg-surface-container transition-all"
          >
            Back to course
          </Link>
        </div>
      </main>
    </div>
  )
}
