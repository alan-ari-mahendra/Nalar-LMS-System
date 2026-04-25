// lib/actions/enrollment.ts
"use server"

import crypto from "crypto"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { EnrollmentSchema } from "./schemas"
import type { EnrollmentInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function enrollInCourse(data: EnrollmentInput): Promise<ActionResult> {
  const parsed = EnrollmentSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  if (user.role !== "STUDENT") {
    return { success: false, error: "Only students can enroll in courses" }
  }

  const { courseId } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED", deletedAt: null },
    select: { id: true, instructorId: true, price: true, isFree: true, title: true },
  })

  if (!course) {
    return { success: false, error: "Course not found" }
  }

  if (course.instructorId === user.id) {
    return { success: false, error: "You cannot enroll in your own course" }
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (existing) {
    return { success: false, error: "You are already enrolled in this course" }
  }

  const price = Number(course.price)

  await prisma.$transaction(async (tx) => {
    // Create order for paid courses (demo payment)
    if (price > 0) {
      await tx.order.create({
        data: {
          userId: user.id,
          courseId,
          amount: course.price,
          status: "COMPLETED",
          paymentMethod: "demo",
          paymentId: `demo_${crypto.randomUUID()}`,
          paidAt: new Date(),
        },
      })
    }

    // Create enrollment
    await tx.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        progressPercent: 0,
      },
    })

    // Increment cached enrollment count
    await tx.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } },
    })

    // Create notification for student
    await tx.notification.create({
      data: {
        userId: user.id,
        type: "ENROLLMENT",
        title: "Enrolled successfully",
        message: `You have enrolled in "${course.title}"`,
        metadata: { courseId },
      },
    })
  })

  return { success: true }
}
