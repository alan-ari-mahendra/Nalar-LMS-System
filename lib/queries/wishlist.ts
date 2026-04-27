import { prisma } from "@/lib/db"
import { serializeCourse } from "@/lib/serializers"
import type { Course } from "@/type"

const wishlistCourseInclude = {
  instructor: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      _count: { select: { courses: true } },
    },
  },
  category: { select: { id: true, name: true, slug: true } },
} as const

export async function getWishlistByUser(userId: string): Promise<Course[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId, course: { deletedAt: null, status: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    include: { course: { include: wishlistCourseInclude } },
  })
  return items.map((i) => serializeCourse(i.course))
}

export async function getWishlistedCourseIds(userId: string): Promise<Set<string>> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { courseId: true },
  })
  return new Set(items.map((i) => i.courseId))
}

export async function isCourseWishlisted(userId: string, courseId: string): Promise<boolean> {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  })
  return Boolean(item)
}
