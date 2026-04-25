import { requireRole } from "@/lib/auth/guards"
import { getAllOrders } from "@/lib/queries/order"
import type { OrderStatus } from "@prisma/client"
import { AdminOrdersClient } from "./AdminOrdersClient"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  await requireRole(["ADMIN"])
  const { status, q } = await searchParams

  const validStatus =
    status && ["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)
      ? (status as OrderStatus)
      : undefined

  const orders = await getAllOrders({ status: validStatus, search: q })

  return <AdminOrdersClient orders={orders} initialStatus={status ?? "ALL"} initialQuery={q ?? ""} />
}
