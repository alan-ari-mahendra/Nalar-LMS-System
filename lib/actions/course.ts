"use server"

import crypto from "crypto"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"
import {
  CourseStatusSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateChapterSchema,
  UpdateChapterSchema,
  DeleteChapterSchema,
  CreateLessonSchema,
  UpdateLessonSchema,
  DeleteLessonSchema,
  ReorderChaptersSchema,
  ReorderLessonsSchema,
} from "./schemas"
import type {
  CourseStatusInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateChapterInput,
  UpdateChapterInput,
  DeleteChapterInput,
  CreateLessonInput,
  UpdateLessonInput,
  DeleteLessonInput,
  ReorderChaptersInput,
  ReorderLessonsInput,
} from "./schemas"

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string }

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const suffix = crypto.randomUUID().slice(0, 6)
  return `${base}-${suffix}`
}

async function recalculateCourseCounts(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  courseId: string
) {
  const lessons = await tx.lesson.findMany({
    where: { chapter: { courseId, deletedAt: null }, deletedAt: null },
    select: { duration: true },
  })
  await tx.course.update({
    where: { id: courseId },
    data: {
      totalLessons: lessons.length,
      totalDuration: lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0),
    },
  })
}

function revalidateBuilder(courseId: string) {
  revalidatePath(`/dashboard/instructor/courses/${courseId}/builder`)
  revalidatePath(`/dashboard/instructor/courses/${courseId}`)
}

async function verifyCourseOwnership(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { id: true, instructorId: true, title: true },
  })
  if (!course) return null
  if (course.instructorId !== userId) return null
  return course
}

// --- Course CRUD ---

export async function createCourse(data: CreateCourseInput): Promise<ActionResult> {
  const parsed = CreateCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { title, description, shortDesc, price, level, categoryId, thumbnailUrl } = parsed.data

  const slug = generateSlug(title)

  const course = await prisma.course.create({
    data: {
      title, slug, description, shortDesc, thumbnailUrl,
      price, isFree: price === 0, level, categoryId,
      instructorId: user.id, status: "DRAFT",
    },
  })

  return { success: true, id: course.id }
}

export async function updateCourse(data: UpdateCourseInput): Promise<ActionResult> {
  const parsed = UpdateCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId, ...fields } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  const updateData: Record<string, unknown> = { ...fields }
  if (fields.title) updateData.slug = generateSlug(fields.title)
  if (fields.price !== undefined) updateData.isFree = fields.price === 0

  await prisma.course.update({ where: { id: courseId }, data: updateData })
  revalidateBuilder(courseId)
  return { success: true }
}

// --- Chapter CRUD ---

export async function createChapter(data: CreateChapterInput): Promise<ActionResult> {
  const parsed = CreateChapterSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId, title, description } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  const maxPos = await prisma.chapter.aggregate({
    where: { courseId, deletedAt: null },
    _max: { position: true },
  })

  const chapter = await prisma.chapter.create({
    data: { courseId, title, description: description ?? null, position: (maxPos._max.position ?? 0) + 1 },
  })

  revalidateBuilder(courseId)
  return { success: true, id: chapter.id }
}

export async function updateChapter(data: UpdateChapterInput): Promise<ActionResult> {
  const parsed = UpdateChapterSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { chapterId, ...fields } = parsed.data

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, deletedAt: null },
    select: { courseId: true, course: { select: { instructorId: true } } },
  })
  if (!chapter || (chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Chapter not found or you don't own it" }
  }

  await prisma.chapter.update({ where: { id: chapterId }, data: fields })
  revalidateBuilder(chapter.courseId)
  return { success: true }
}

export async function deleteChapter(data: DeleteChapterInput): Promise<ActionResult> {
  const parsed = DeleteChapterSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { chapterId } = parsed.data

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, deletedAt: null },
    select: { courseId: true, course: { select: { instructorId: true } } },
  })
  if (!chapter || (chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Chapter not found or you don't own it" }
  }

  await prisma.$transaction(async (tx) => {
    const now = new Date()
    await tx.lesson.updateMany({ where: { chapterId, deletedAt: null }, data: { deletedAt: now } })
    await tx.chapter.update({ where: { id: chapterId }, data: { deletedAt: now } })
    await recalculateCourseCounts(tx, chapter.courseId)
  })

  revalidateBuilder(chapter.courseId)
  return { success: true }
}

// --- Lesson CRUD ---

export async function createLesson(data: CreateLessonInput): Promise<ActionResult> {
  const parsed = CreateLessonSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { chapterId, title, type, content, videoUrl, duration } = parsed.data

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, deletedAt: null },
    select: { courseId: true, course: { select: { instructorId: true } } },
  })
  if (!chapter || (chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Chapter not found or you don't own it" }
  }

  const maxPos = await prisma.lesson.aggregate({
    where: { chapterId, deletedAt: null },
    _max: { position: true },
  })

  await prisma.$transaction(async (tx) => {
    await tx.lesson.create({
      data: {
        chapterId, title, type,
        content: content ?? null, videoUrl: videoUrl ?? null, duration: duration ?? null,
        position: (maxPos._max.position ?? 0) + 1,
      },
    })
    await recalculateCourseCounts(tx, chapter.courseId)
  })

  revalidateBuilder(chapter.courseId)
  return { success: true }
}

export async function updateLesson(data: UpdateLessonInput): Promise<ActionResult> {
  const parsed = UpdateLessonSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { lessonId, ...fields } = parsed.data

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, deletedAt: null },
    select: { chapter: { select: { courseId: true, course: { select: { instructorId: true } } } } },
  })
  if (!lesson || (lesson.chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Lesson not found or you don't own it" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.lesson.update({ where: { id: lessonId }, data: fields })
    await recalculateCourseCounts(tx, lesson.chapter.courseId)
  })

  revalidateBuilder(lesson.chapter.courseId)
  return { success: true }
}

export async function deleteLesson(data: DeleteLessonInput): Promise<ActionResult> {
  const parsed = DeleteLessonSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { lessonId } = parsed.data

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, deletedAt: null },
    select: { chapter: { select: { courseId: true, course: { select: { instructorId: true } } } } },
  })
  if (!lesson || (lesson.chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Lesson not found or you don't own it" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.lesson.update({ where: { id: lessonId }, data: { deletedAt: new Date() } })
    await recalculateCourseCounts(tx, lesson.chapter.courseId)
  })

  revalidateBuilder(lesson.chapter.courseId)
  return { success: true }
}

// --- Course Status ---

export async function publishCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  return { success: true }
}

export async function archiveCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "ARCHIVED" },
  })

  return { success: true }
}

export async function deleteCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { deletedAt: new Date() },
  })

  return { success: true }
}

// --- Reorder ---

export async function reorderChapters(data: ReorderChaptersInput): Promise<ActionResult> {
  const parsed = ReorderChaptersSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId, orderedIds } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  const existing = await prisma.chapter.findMany({
    where: { courseId, deletedAt: null },
    select: { id: true },
  })
  const existingIds = new Set(existing.map((c) => c.id))
  for (const id of orderedIds) {
    if (!existingIds.has(id)) {
      return { success: false, error: "Chapter not found in course" }
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.chapter.update({ where: { id }, data: { position: index + 1 } })
    )
  )

  revalidateBuilder(courseId)
  return { success: true }
}

export async function reorderLessons(data: ReorderLessonsInput): Promise<ActionResult> {
  const parsed = ReorderLessonsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { chapterId, orderedIds } = parsed.data

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, deletedAt: null },
    select: { course: { select: { instructorId: true } } },
  })
  if (!chapter || (chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Chapter not found or you don't own it" }
  }

  const existing = await prisma.lesson.findMany({
    where: { chapterId, deletedAt: null },
    select: { id: true },
  })
  const existingIds = new Set(existing.map((l) => l.id))
  for (const id of orderedIds) {
    if (!existingIds.has(id)) {
      return { success: false, error: "Lesson not found in chapter" }
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.lesson.update({ where: { id }, data: { position: index + 1 } })
    )
  )

  const ch = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { courseId: true },
  })
  if (ch) revalidateBuilder(ch.courseId)
  return { success: true }
}
