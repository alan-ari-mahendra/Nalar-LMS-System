// lib/actions/enrollment.ts
"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { createEnrollmentTx } from "@/lib/server/enrollment-helpers"
import { getEnrollmentsByUser } from "@/lib/queries/enrollment"
import { getCertificatesByUser } from "@/lib/queries/student"
import { EnrollmentSchema } from "./schemas"
import type { EnrollmentInput } from "./schemas"
import type { Enrollment, Certificate } from "@/type"

export type EnrollmentWithNext = Enrollment & { nextLessonId: string | null }

type ActionResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Enrolls a user in a free course.
 *
 * Free courses bypass the checkout flow entirely — no Order is created.
 * For paid courses use the checkout flow (lib/actions/order.ts:createOrder).
 */
export async function enrollInFreeCourse(data: EnrollmentInput): Promise<ActionResult> {
  const parsed = EnrollmentSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { courseId } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED", deletedAt: null },
    select: { id: true, instructorId: true, price: true, isFree: true, title: true },
  })

  if (!course) {
    return { success: false, error: "Course not found" }
  }

  if (Number(course.price) > 0 || !course.isFree) {
    return { success: false, error: "This course requires payment. Please use the checkout flow." }
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

  await prisma.$transaction(async (tx) => {
    await createEnrollmentTx(tx, {
      userId: user.id,
      courseId,
      courseTitle: course.title,
    })
  })

  return { success: true }
}

/**
 * @deprecated Free courses → use `enrollInFreeCourse`. Paid courses → checkout flow.
 *
 * Kept as a thin facade for any legacy callers. Routes free courses to
 * `enrollInFreeCourse`; rejects paid courses with guidance to use checkout.
 */
export async function enrollInCourse(data: EnrollmentInput): Promise<ActionResult> {
  const parsed = EnrollmentSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId, status: "PUBLISHED", deletedAt: null },
    select: { id: true, isFree: true, price: true },
  })
  if (!course) return { success: false, error: "Course not found" }

  if (course.isFree && Number(course.price) === 0) {
    return enrollInFreeCourse(data)
  }
  return { success: false, error: "Use checkout flow for paid courses" }
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
