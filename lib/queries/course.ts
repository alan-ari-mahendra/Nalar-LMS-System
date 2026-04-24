import { prisma } from "@/lib/db"
import { serializeCourse, serializeCourseDetail } from "@/lib/serializers"
import type { Course, CourseDetail } from "@/type"

const courseInclude = {
  instructor: { select: { id: true, name: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
} as const

/** Get published courses with instructor + category */
export async function getPublishedCourses(): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    include: courseInclude,
    orderBy: { publishedAt: "desc" },
  })
  return rows.map(serializeCourse)
}

/** Get featured courses (first N published) */
export async function getFeaturedCourses(limit = 3): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    include: courseInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  })
  return rows.map(serializeCourse)
}

/** Get full course detail by slug — includes chapters, lessons, reviews, attachments */
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const row = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          _count: { select: { courses: true } },
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      chapters: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
          },
        },
      },
      attachments: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  })
  if (!row) return null
  return serializeCourseDetail(row)
}
