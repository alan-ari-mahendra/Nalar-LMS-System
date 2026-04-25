import { prisma } from "@/lib/db"
import { serializeCourse, serializeCourseDetail } from "@/lib/serializers"
import type { Course, CourseDetail } from "@/type"

const courseInclude = {
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

/** Get platform-wide stats for landing page */
export async function getPlatformStats() {
  const [totalStudents, totalCourses, ratingResult] = await Promise.all([
    prisma.enrollment.groupBy({
      by: ["userId"],
      _count: true,
    }).then((rows) => rows.length),
    prisma.course.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.course.aggregate({
      where: { status: "PUBLISHED", deletedAt: null, reviewCount: { gt: 0 } },
      _avg: { rating: true },
    }),
  ])

  return {
    totalStudents,
    totalCourses,
    avgRating: ratingResult._avg.rating
      ? Math.round(ratingResult._avg.rating * 10) / 10
      : 0,
  }
}

/** Get top reviews for testimonials section */
export async function getTopReviews(limit = 3) {
  const rows = await prisma.review.findMany({
    where: { rating: { gte: 4 } },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return rows.map((r) => ({
    id: r.id,
    quote: r.comment ?? "",
    authorName: r.user.name ?? "Student",
    authorRole: "Student",
    authorCompany: "Learnify",
    avatarUrl: r.user.avatarUrl ?? "",
    courseTitle: r.course.title,
    rating: r.rating,
  }))
}

/** Get course with full curriculum by ID (for player page) */
export async function getCourseWithCurriculum(courseId: string): Promise<CourseDetail | null> {
  const row = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
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
