"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"
import {
  RequestPayoutSchema,
  ApprovePayoutSchema,
  RejectPayoutSchema,
} from "./schemas"
import type {
  RequestPayoutInput,
  ApprovePayoutInput,
  RejectPayoutInput,
} from "./schemas"

type ActionResult = { success: true; id?: string } | { success: false; error: string }

export async function getInstructorBalance(instructorId: string): Promise<number> {
  const earnedAgg = await prisma.order.aggregate({
    where: {
      status: "COMPLETED",
      course: { instructorId },
    },
    _sum: { amount: true },
  })
  const earned = Number(earnedAgg._sum.amount ?? 0)

  const paidAgg = await prisma.payout.aggregate({
    where: { instructorId, status: "APPROVED" },
    _sum: { amount: true },
  })
  const paid = Number(paidAgg._sum.amount ?? 0)

  const pendingAgg = await prisma.payout.aggregate({
    where: { instructorId, status: "PENDING" },
    _sum: { amount: true },
  })
  const pending = Number(pendingAgg._sum.amount ?? 0)

  return Math.max(0, earned - paid - pending)
}

export async function requestPayout(data: RequestPayoutInput): Promise<ActionResult> {
  const parsed = RequestPayoutSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { amount, bankName, accountNumber, accountHolder, note } = parsed.data

  const balance = await getInstructorBalance(user.id)
  if (amount > balance) {
    return { success: false, error: `Available balance is Rp ${balance.toLocaleString("id-ID")}` }
  }

  const payout = await prisma.payout.create({
    data: {
      instructorId: user.id,
      amount: new Prisma.Decimal(amount),
      bankName,
      accountNumber,
      accountHolder,
      note: note ?? null,
    },
  })

  revalidatePath("/dashboard/instructor/payouts")
  revalidatePath("/dashboard/admin/payouts")
  return { success: true, id: payout.id }
}

export async function approvePayout(data: ApprovePayoutInput): Promise<ActionResult> {
  const parsed = ApprovePayoutSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const admin = await requireRole(["ADMIN"])
  const { payoutId } = parsed.data

  try {
    await prisma.payout.update({
      where: { id: payoutId, status: "PENDING" },
      data: {
        status: "APPROVED",
        processedAt: new Date(),
        processedBy: admin.id,
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { success: false, error: "Payout not found or not pending" }
    }
    throw err
  }

  revalidatePath("/dashboard/admin/payouts")
  revalidatePath("/dashboard/instructor/payouts")
  return { success: true }
}

export async function rejectPayout(data: RejectPayoutInput): Promise<ActionResult> {
  const parsed = RejectPayoutSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const admin = await requireRole(["ADMIN"])
  const { payoutId, reason } = parsed.data

  try {
    await prisma.payout.update({
      where: { id: payoutId, status: "PENDING" },
      data: {
        status: "REJECTED",
        rejectReason: reason,
        processedAt: new Date(),
        processedBy: admin.id,
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { success: false, error: "Payout not found or not pending" }
    }
    throw err
  }

  revalidatePath("/dashboard/admin/payouts")
  revalidatePath("/dashboard/instructor/payouts")
  return { success: true }
}
