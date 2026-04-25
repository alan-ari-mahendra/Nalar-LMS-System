// lib/actions/review.ts
"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { ReviewSchema } from "./schemas"
import type { ReviewInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function submitReview(data: ReviewInput): Promise<ActionResult> {
  const parsed = ReviewSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { courseId, rating, comment } = parsed.data

  // Verify enrollment + completion
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (!enrollment) {
    return { success: false, error: "You must be enrolled in this course to review it" }
  }

  if (enrollment.progressPercent < 100) {
    return { success: false, error: "You must complete the course before leaving a review" }
  }

  // Check for duplicate review
  const existingReview = await prisma.review.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (existingReview) {
    return { success: false, error: "You have already reviewed this course" }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  })

  if (!course) {
    return { success: false, error: "Course not found" }
  }

  await prisma.$transaction(async (tx) => {
    // Create review
    await tx.review.create({
      data: {
        userId: user.id,
        courseId,
        rating,
        comment,
      },
    })

    // Recalculate course rating + review count
    const aggregation = await tx.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await tx.course.update({
      where: { id: courseId },
      data: {
        rating: aggregation._avg.rating ?? 0,
        reviewCount: aggregation._count.rating,
      },
    })

    // Notify instructor
    await tx.notification.create({
      data: {
        userId: course.instructorId,
        type: "NEW_REVIEW",
        title: "New course review",
        message: `${user.name ?? "A student"} left a ${rating}-star review on "${course.title}"`,
        metadata: { courseId },
      },
    })
  })

  return { success: true }
}
