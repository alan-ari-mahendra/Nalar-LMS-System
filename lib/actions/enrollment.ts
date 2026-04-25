// lib/actions/enrollment.ts
"use server"

import crypto from "crypto"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { getEnrollmentsByUser } from "@/lib/queries/enrollment"
import { getCertificatesByUser } from "@/lib/queries/student"
import { EnrollmentSchema } from "./schemas"
import type { EnrollmentInput } from "./schemas"
import type { Enrollment, Certificate } from "@/type"

export type EnrollmentWithNext = Enrollment & { nextLessonId: string | null }

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

async function getNextIncompleteLessonId(
  userId: string,
  courseId: string
): Promise<string | null> {
  const chapters = await prisma.chapter.findMany({
    where: { courseId, deletedAt: null },
    orderBy: { position: "asc" },
    select: {
      lessons: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        select: { id: true },
      },
    },
  })
  const lessonIds = chapters.flatMap((c) => c.lessons.map((l) => l.id))
  if (lessonIds.length === 0) return null

  const completed = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds }, isCompleted: true },
    select: { lessonId: true },
  })
  const completedSet = new Set(completed.map((c) => c.lessonId))
  const next = lessonIds.find((id) => !completedSet.has(id))
  return next ?? lessonIds[0]
}

export async function getMyEnrollments(): Promise<EnrollmentWithNext[]> {
  const user = await requireAuth()
  const enrollments = await getEnrollmentsByUser(user.id)
  return Promise.all(
    enrollments.map(async (e) => ({
      ...e,
      nextLessonId: await getNextIncompleteLessonId(user.id, e.courseId),
    }))
  )
}

export async function getMyCertificates(): Promise<Certificate[]> {
  const user = await requireAuth()
  return getCertificatesByUser(user.id)
}
