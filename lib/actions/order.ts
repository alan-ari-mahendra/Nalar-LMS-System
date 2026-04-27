// lib/actions/order.ts
"use server"

import crypto from "crypto"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth/guards"
import { createEnrollmentTx } from "@/lib/server/enrollment-helpers"
import {
  CreateOrderSchema,
  OrderIdSchema,
  RefundOrderSchema,
} from "./schemas"
import type {
  CreateOrderInput,
  OrderIdInput,
  RefundOrderInput,
} from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

type CreateOrderResult =
  | { success: true; orderId: string; resumed?: boolean }
  | { success: false; error: string }

function isStatusGuardError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
}

/**
 * Create a PENDING Order for a paid course. Resumes existing PENDING order
 * if one exists for this user/course (paymentMethod preserved from original).
 *
 * Free courses must use enrollInFreeCourse — this action rejects them.
 */
export async function createOrder(data: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = CreateOrderSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { courseId, paymentMethod, couponCode } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED", deletedAt: null },
    select: { id: true, instructorId: true, price: true, isFree: true, title: true },
  })

  if (!course) {
    return { success: false, error: "Course not found" }
  }

  if (course.isFree || Number(course.price) <= 0) {
    return { success: false, error: "This is a free course. Use the free enrollment flow." }
  }

  if (course.instructorId === user.id) {
    return { success: false, error: "You cannot purchase your own course" }
  }

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })
  if (enrolled) {
    return { success: false, error: "You are already enrolled in this course" }
  }

  // Resolve coupon (optional)
  let couponId: string | null = null
  let amount = new Prisma.Decimal(course.price)
  if (couponCode && couponCode.trim()) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    })
    if (!coupon || !coupon.isActive) {
      return { success: false, error: "Invalid or inactive coupon" }
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { success: false, error: "Coupon has expired" }
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { success: false, error: "Coupon usage limit reached" }
    }
    couponId = coupon.id
    const discounted = Number(course.price) * (1 - coupon.discountPercent / 100)
    amount = new Prisma.Decimal(Math.max(0, Math.round(discounted)))
  }

  // Resume: reuse existing PENDING order — paymentMethod preserved
  const pending = await prisma.order.findFirst({
    where: { userId: user.id, courseId, status: "PENDING" },
    select: { id: true },
  })
  if (pending) {
    return { success: true, orderId: pending.id, resumed: true }
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      courseId,
      amount,
      status: "PENDING",
      paymentMethod,
      couponId,
      metadata: { mock: true, createdAt: new Date().toISOString() },
    },
    select: { id: true },
  })

  return { success: true, orderId: order.id }
}

/**
 * Mark a PENDING order as COMPLETED and create the Enrollment + notification.
 * Race-safe via compound `where: { id, status: "PENDING" }`.
 */
export async function mockConfirmPayment(data: OrderIdInput): Promise<ActionResult> {
  const parsed = OrderIdSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { orderId } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      courseId: true,
      status: true,
      metadata: true,
      course: { select: { title: true } },
    },
  })

  if (!order || order.userId !== user.id) {
    return { success: false, error: "Order not found" }
  }

  if (order.status !== "PENDING") {
    return { success: false, error: `Order is not pending (current: ${order.status})` }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId, status: "PENDING" },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          paymentId: `mock_${crypto.randomUUID()}`,
          metadata: {
            ...((order.metadata as Record<string, unknown> | null) ?? {}),
            confirmedAt: new Date().toISOString(),
          },
        },
        select: { couponId: true },
      })

      if (updated.couponId) {
        await tx.coupon.update({
          where: { id: updated.couponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      // Defensive: if Enrollment somehow already exists, skip helper
      const existingEnrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: order.courseId } },
        select: { id: true },
      })
      if (!existingEnrollment) {
        await createEnrollmentTx(tx, {
          userId: user.id,
          courseId: order.courseId,
          courseTitle: order.course.title,
        })
      }
    })
  } catch (err) {
    if (isStatusGuardError(err)) {
      return { success: false, error: "Order is no longer pending" }
    }
    throw err
  }

  revalidatePath("/dashboard/courses")
  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/instructor/revenue")
  return { success: true }
}

/**
 * Mark a PENDING order as FAILED. Used by mock gateway "fail" simulation.
 */
export async function mockFailPayment(data: OrderIdInput): Promise<ActionResult> {
  const parsed = OrderIdSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { orderId } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, status: true, metadata: true },
  })
  if (!order || order.userId !== user.id) {
    return { success: false, error: "Order not found" }
  }

  try {
    await prisma.order.update({
      where: { id: orderId, status: "PENDING" },
      data: {
        status: "FAILED",
        metadata: {
          ...((order.metadata as Record<string, unknown> | null) ?? {}),
          reason: "Mock gateway failure",
          failedAt: new Date().toISOString(),
        },
      },
    })
  } catch (err) {
    if (isStatusGuardError(err)) {
      return { success: false, error: "Order is not pending" }
    }
    throw err
  }

  revalidatePath("/dashboard/orders")
  return { success: true }
}

/**
 * User cancels a PENDING order before paying. Same DB transition as fail
 * but with distinct reason for audit purposes.
 */
export async function cancelOrder(data: OrderIdInput): Promise<ActionResult> {
  const parsed = OrderIdSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { orderId } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, status: true, metadata: true },
  })
  if (!order || order.userId !== user.id) {
    return { success: false, error: "Order not found" }
  }

  try {
    await prisma.order.update({
      where: { id: orderId, status: "PENDING" },
      data: {
        status: "FAILED",
        metadata: {
          ...((order.metadata as Record<string, unknown> | null) ?? {}),
          reason: "Cancelled by user",
          cancelledAt: new Date().toISOString(),
        },
      },
    })
  } catch (err) {
    if (isStatusGuardError(err)) {
      return { success: false, error: "Order is not pending" }
    }
    throw err
  }

  revalidatePath("/dashboard/orders")
  return { success: true }
}

/**
 * Admin refund. Marks COMPLETED order as REFUNDED.
 *
 * Tradeoff: enrollment + lesson progress are PRESERVED to avoid destroying
 * student data. Real-world implementations may revoke access — adjust if
 * business policy changes.
 */
export async function refundOrder(data: RefundOrderInput): Promise<ActionResult> {
  const parsed = RefundOrderSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const admin = await requireRole(["ADMIN"])
  const { orderId, reason } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, metadata: true },
  })
  if (!order) {
    return { success: false, error: "Order not found" }
  }

  try {
    await prisma.order.update({
      where: { id: orderId, status: "COMPLETED" },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
        metadata: {
          ...((order.metadata as Record<string, unknown> | null) ?? {}),
          refundReason: reason,
          refundedBy: admin.id,
          refundedAt: new Date().toISOString(),
        },
      },
    })
  } catch (err) {
    if (isStatusGuardError(err)) {
      return { success: false, error: "Order is not in a refundable state" }
    }
    throw err
  }

  revalidatePath("/dashboard/admin/orders")
  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/instructor/revenue")
  return { success: true }
}
