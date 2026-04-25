import Link from "next/link"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/guards"
import { getOrderById } from "@/lib/queries/order"
import { getPaymentMethodMeta } from "@/lib/payment/methods"
import { prisma } from "@/lib/db"
import { formatPrice } from "@/lib/utils"

export default async function SuccessPage({
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
  if (order.status === "FAILED") {
    redirect(`/checkout/order/${orderId}/failed`)
  }

  const methodMeta = getPaymentMethodMeta(order.paymentMethod)

  // Find first lesson for "Start Learning" CTA
  const firstChapter = await prisma.chapter.findFirst({
    where: { courseId: order.course.id, deletedAt: null },
    orderBy: { position: "asc" },
    select: {
      lessons: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        take: 1,
        select: { id: true },
      },
    },
  })
  const firstLessonId = firstChapter?.lessons[0]?.id ?? null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-tertiary/15 border border-tertiary/30 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined !text-5xl text-tertiary">check_circle</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">
            Payment successful!
          </h1>
          <p className="text-on-surface-variant">
            You&apos;re enrolled. Time to start learning.
          </p>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden mb-6">
          <div className="p-5 flex items-center gap-4 border-b border-outline-variant">
            <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0">
              <Image src={order.course.thumbnailUrl} alt={order.course.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-on-surface-variant">Course</p>
              <p className="text-sm font-bold text-on-surface line-clamp-1">{order.course.title}</p>
            </div>
          </div>

          <dl className="p-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Amount paid</dt>
              <dd className="font-bold text-on-surface">{formatPrice(order.amount)}</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Method</dt>
              <dd className="text-on-surface flex items-center gap-1.5">
                {methodMeta && (
                  <span className="material-symbols-outlined !text-base text-on-surface-variant">
                    {methodMeta.icon}
                  </span>
                )}
                {methodMeta?.label ?? order.paymentMethod ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Order ID</dt>
              <dd className="font-mono text-xs text-on-surface">{order.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Paid at</dt>
              <dd className="text-on-surface">
                {order.paidAt ? new Date(order.paidAt).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {firstLessonId ? (
            <Link
              href={`/learn/${order.course.id}/${firstLessonId}`}
              className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold text-sm text-center hover:brightness-110 transition-all"
            >
              Start Learning
            </Link>
          ) : (
            <Link
              href={`/courses/${order.course.slug}`}
              className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold text-sm text-center hover:brightness-110 transition-all"
            >
              View Course
            </Link>
          )}
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="flex-1 border border-outline-variant bg-surface-container-low py-3 rounded-lg font-bold text-sm text-on-surface text-center hover:bg-surface-container transition-all"
          >
            View Order
          </Link>
        </div>
      </main>
    </div>
  )
}
