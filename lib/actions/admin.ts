"use server"

import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"
import { ToggleUserSchema, CourseStatusSchema, RejectCourseSchema, ChangeRoleSchema } from "./schemas"
import type { ToggleUserInput, CourseStatusInput, RejectCourseInput, ChangeRoleInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function toggleUserActive(data: ToggleUserInput): Promise<ActionResult> {
  const parsed = ToggleUserSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const admin = await requireRole(["ADMIN"])
  const { userId } = parsed.data

  if (userId === admin.id) return { success: false, error: "You cannot ban yourself" }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { isActive: !user.isActive } })
    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: user.isActive ? "USER_BANNED" : "USER_UNBANNED",
        metadata: { targetUserId: userId, targetEmail: user.email },
      },
    })
  })

  return { success: true }
}

export async function changeUserRole(data: ChangeRoleInput): Promise<ActionResult> {
  const parsed = ChangeRoleSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const admin = await requireRole(["ADMIN"])
  const { userId, role } = parsed.data

  if (userId === admin.id) return { success: false, error: "You cannot change your own role" }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role } })
    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: "ROLE_CHANGE",
        metadata: { targetUserId: userId, oldRole: user.role, newRole: role },
      },
    })
  })

  return { success: true }
}

export async function approveCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { courseId } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { instructorId: true, title: true },
  })
  if (!course) return { success: false, error: "Course not found" }

  await prisma.$transaction(async (tx) => {
    await tx.course.update({ where: { id: courseId }, data: { status: "PUBLISHED", publishedAt: new Date() } })
    await tx.notification.create({
      data: {
        userId: course.instructorId,
        type: "COURSE_APPROVED",
        title: "Course approved!",
        message: `Your course "${course.title}" has been approved and published.`,
        metadata: { courseId },
      },
    })
  })

  return { success: true }
}

export async function rejectCourse(data: RejectCourseInput): Promise<ActionResult> {
  const parsed = RejectCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { courseId, reason } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { instructorId: true, title: true },
  })
  if (!course) return { success: false, error: "Course not found" }

  await prisma.$transaction(async (tx) => {
    await tx.course.update({ where: { id: courseId }, data: { status: "DRAFT" } })
    await tx.notification.create({
      data: {
        userId: course.instructorId,
        type: "COURSE_REJECTED",
        title: "Course needs revision",
        message: `Your course "${course.title}" was not approved. Reason: ${reason}`,
        metadata: { courseId, reason },
      },
    })
  })

  return { success: true }
}
