"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"
import {
  CreateCouponSchema,
  UpdateCouponSchema,
  DeleteCouponSchema,
  ValidateCouponSchema,
} from "./schemas"
import type {
  CreateCouponInput,
  UpdateCouponInput,
  DeleteCouponInput,
  ValidateCouponInput,
} from "./schemas"

type ActionResult = { success: true; id?: string } | { success: false; error: string }

type ValidateResult =
  | {
      success: true
      couponId: string
      code: string
      discountPercent: number
      originalAmount: number
      discountAmount: number
      finalAmount: number
    }
  | { success: false; error: string }

export async function createCoupon(data: CreateCouponInput): Promise<ActionResult> {
  const parsed = CreateCouponSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { code, discountPercent, maxUses, expiresAt, isActive } = parsed.data

  const existing = await prisma.coupon.findUnique({ where: { code } })
  if (existing) return { success: false, error: "Coupon code already exists" }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountPercent,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive,
    },
  })

  revalidatePath("/dashboard/admin/coupons")
  return { success: true, id: coupon.id }
}

export async function updateCoupon(data: UpdateCouponInput): Promise<ActionResult> {
  const parsed = UpdateCouponSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { couponId, expiresAt, ...rest } = parsed.data

  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      ...rest,
      ...(expiresAt !== undefined && {
        expiresAt: expiresAt === null ? null : new Date(expiresAt),
      }),
    },
  })

  revalidatePath("/dashboard/admin/coupons")
  return { success: true }
}

export async function deleteCoupon(data: DeleteCouponInput): Promise<ActionResult> {
  const parsed = DeleteCouponSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { couponId } = parsed.data

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } })
  if (!coupon) return { success: false, error: "Coupon not found" }

  if (coupon.usedCount > 0) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    })
  } else {
    await prisma.coupon.delete({ where: { id: couponId } })
  }

  revalidatePath("/dashboard/admin/coupons")
  return { success: true }
}

export async function validateCoupon(data: ValidateCouponInput): Promise<ValidateResult> {
  const parsed = ValidateCouponSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { code, courseId } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null, status: "PUBLISHED" },
    select: { price: true, isFree: true },
  })
  if (!course) return { success: false, error: "Course not found" }
  if (course.isFree || Number(course.price) <= 0) {
    return { success: false, error: "Coupons can only be applied to paid courses" }
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
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

  const originalAmount = Number(course.price)
  const discountAmount = Math.round((originalAmount * coupon.discountPercent) / 100)
  const finalAmount = Math.max(0, originalAmount - discountAmount)

  return {
    success: true,
    couponId: coupon.id,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    originalAmount,
    discountAmount,
    finalAmount,
  }
}
