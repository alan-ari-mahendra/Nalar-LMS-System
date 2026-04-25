import { prisma } from "@/lib/db"
import type { CourseStatus, CourseLevel, Role } from "@prisma/client"

export interface AdminUserRow {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  role: Role
  isActive: boolean
  createdAt: Date
}

export interface AdminCourseRow {
  id: string
  title: string
  slug: string
  thumbnailUrl: string
  status: CourseStatus
  level: CourseLevel
  price: { toNumber(): number } | number
  enrollmentCount: number
  createdAt: Date
  instructor: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

/** Get all users for admin management */
export async function getAllUsers(): Promise<AdminUserRow[]> {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

/** Get all courses for admin review */
export async function getAllCoursesAdmin(): Promise<AdminCourseRow[]> {
  return prisma.course.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      status: true,
      level: true,
      price: true,
      enrollmentCount: true,
      createdAt: true,
      instructor: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
