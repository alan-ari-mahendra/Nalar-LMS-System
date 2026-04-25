// lib/actions/progress.ts
"use server"

import crypto from "crypto"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { LessonCompleteSchema, WatchProgressSchema } from "./schemas"
import type { LessonCompleteInput, WatchProgressInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

async function verifyEnrollment(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { chapter: { select: { courseId: true } } },
  })
  if (!lesson) return null

  const courseId = lesson.chapter.courseId
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!enrollment) return null

  return { courseId, enrollmentId: enrollment.id }
}

export async function markLessonComplete(data: LessonCompleteInput): Promise<ActionResult> {
  const parsed = LessonCompleteSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { lessonId } = parsed.data

  const context = await verifyEnrollment(user.id, lessonId)
  if (!context) {
    return { success: false, error: "You are not enrolled in this course" }
  }

  const { courseId } = context

  await prisma.$transaction(async (tx) => {
    // Upsert lesson progress
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: {
        userId: user.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    // Recalculate progress percentage
    const allLessonIds = await tx.lesson.findMany({
      where: {
        chapter: { courseId, deletedAt: null },
        deletedAt: null,
      },
      select: { id: true },
    })
    const totalLessons = allLessonIds.length

    const completedLessons = await tx.lessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: allLessonIds.map((l) => l.id) },
        isCompleted: true,
      },
    })

    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    await tx.enrollment.update({
      where: { userId_courseId: { userId: user.id, courseId } },
      data: {
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
      },
    })

    // Auto-issue certificate on 100% completion
    if (progressPercent === 100) {
      const existingCert = await tx.certificate.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
      })

      if (!existingCert) {
        const course = await tx.course.findUnique({
          where: { id: courseId },
          select: { title: true },
        })

        await tx.certificate.create({
          data: {
            userId: user.id,
            courseId,
            verifyCode: crypto.randomUUID().slice(0, 12),
          },
        })

        await tx.notification.create({
          data: {
            userId: user.id,
            type: "CERTIFICATE_ISSUED",
            title: "Certificate earned!",
            message: `Congratulations! You completed "${course?.title}" and earned a certificate.`,
            metadata: { courseId },
          },
        })
      }
    }
  })

  return { success: true }
}

export async function updateWatchProgress(data: WatchProgressInput): Promise<ActionResult> {
  const parsed = WatchProgressSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { lessonId, watchedSeconds } = parsed.data

  const context = await verifyEnrollment(user.id, lessonId)
  if (!context) {
    return { success: false, error: "You are not enrolled in this course" }
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      watchedSeconds,
    },
    update: {
      watchedSeconds,
    },
  })

  return { success: true }
}
