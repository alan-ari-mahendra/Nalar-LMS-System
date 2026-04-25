import { prisma } from "@/lib/db"
import type { OrderStatus } from "@prisma/client"

export interface OrderRow {
  id: string
  amount: number
  status: OrderStatus
  paymentMethod: string | null
  paymentId: string | null
  paidAt: string | null
  refundedAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string
    price: number
  }
}

export interface AdminOrderRow extends OrderRow {
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

const orderSelect = {
  id: true,
  amount: true,
  status: true,
  paymentMethod: true,
  paymentId: true,
  paidAt: true,
  refundedAt: true,
  metadata: true,
  createdAt: true,
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      price: true,
    },
  },
} as const

type RawOrder = {
  id: string
  amount: { toNumber(): number } | number
  status: OrderStatus
  paymentMethod: string | null
  paymentId: string | null
  paidAt: Date | null
  refundedAt: Date | null
  metadata: unknown
  createdAt: Date
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string
    price: { toNumber(): number } | number
  }
}

function serializeOrder(o: RawOrder): OrderRow {
  return {
    id: o.id,
    amount: Number(o.amount),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentId: o.paymentId,
    paidAt: o.paidAt?.toISOString() ?? null,
    refundedAt: o.refundedAt?.toISOString() ?? null,
    metadata: (o.metadata as Record<string, unknown> | null) ?? null,
    createdAt: o.createdAt.toISOString(),
    course: {
      id: o.course.id,
      title: o.course.title,
      slug: o.course.slug,
      thumbnailUrl: o.course.thumbnailUrl,
      price: Number(o.course.price),
    },
  }
}

export async function getOrdersByUser(
  userId: string,
  opts: { status?: OrderStatus } = {}
): Promise<OrderRow[]> {
  const rows = await prisma.order.findMany({
    where: { userId, ...(opts.status ? { status: opts.status } : {}) },
    orderBy: { createdAt: "desc" },
    select: orderSelect,
  })
  return rows.map(serializeOrder)
}

export async function getOrderById(orderId: string): Promise<
  | (OrderRow & {
      user: AdminOrderRow["user"]
    })
  | null
> {
  const row = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      ...orderSelect,
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  })
  if (!row) return null
  return {
    ...serializeOrder(row),
    user: {
      id: row.user.id,
      name: row.user.name ?? "User",
      email: row.user.email,
      avatarUrl: row.user.avatarUrl,
    },
  }
}

export async function getPendingOrderForCourse(
  userId: string,
  courseId: string
): Promise<{ id: string; paymentMethod: string | null } | null> {
  return prisma.order.findFirst({
    where: { userId, courseId, status: "PENDING" },
    select: { id: true, paymentMethod: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllOrders(
  opts: { status?: OrderStatus; search?: string } = {}
): Promise<AdminOrderRow[]> {
  const where: Record<string, unknown> = {}
  if (opts.status) where.status = opts.status
  if (opts.search && opts.search.trim().length > 0) {
    const q = opts.search.trim()
    where.OR = [
      { paymentId: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { name: { contains: q, mode: "insensitive" } } },
    ]
  }

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      ...orderSelect,
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  })

  return rows.map((r) => ({
    ...serializeOrder(r),
    user: {
      id: r.user.id,
      name: r.user.name ?? "User",
      email: r.user.email,
      avatarUrl: r.user.avatarUrl,
    },
  }))
}
