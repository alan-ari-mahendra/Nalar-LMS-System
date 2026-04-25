import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/guards"
import { getOrderById } from "@/lib/queries/order"
import { getPaymentMethodMeta } from "@/lib/payment/methods"
import { MockGateway } from "./MockGateway"

export default async function PayPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const user = await requireAuth()
  const { orderId } = await params

  const order = await getOrderById(orderId)
  if (!order || order.user.id !== user.id) {
    notFound()
  }

  if (order.status === "COMPLETED") {
    redirect(`/checkout/order/${orderId}/success`)
  }
  if (order.status === "FAILED" || order.status === "REFUNDED") {
    redirect(`/checkout/order/${orderId}/failed`)
  }

  const methodMeta = getPaymentMethodMeta(order.paymentMethod)

  return (
    <MockGateway
      order={{
        id: order.id,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        course: order.course,
      }}
      methodMeta={methodMeta}
    />
  )
}
