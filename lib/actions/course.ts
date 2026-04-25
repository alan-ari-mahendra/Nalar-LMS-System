"use server"

import { prisma } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth/guards"
import { CourseStatusSchema } from "./schemas"
import type { CourseStatusInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

async function verifyCourseOwnership(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { id: true, instructorId: true, title: true },
  })

  if (!course) return null
  if (course.instructorId !== userId) return null
  return course
}

export async function publishCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

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
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

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
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

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
