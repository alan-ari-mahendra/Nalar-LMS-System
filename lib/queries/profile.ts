import { prisma } from "@/lib/db"
import { serializeCourse } from "@/lib/serializers"
import type { Course } from "@/type"

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      headline: true,
      bio: true,
      website: true,
      role: true,
      createdAt: true,
    },
  })
  if (!user) return null

  const [enrollmentCount, certificateCount, authoredCount, authoredRows] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.certificate.count({ where: { userId } }),
    prisma.course.count({
      where: { instructorId: userId, status: "PUBLISHED", deletedAt: null },
    }),
    user.role === "TEACHER" || user.role === "ADMIN"
      ? prisma.course.findMany({
          where: { instructorId: userId, status: "PUBLISHED", deletedAt: null },
          orderBy: { publishedAt: "desc" },
          take: 6,
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
          },
        })
      : Promise.resolve([]),
  ])

  const authoredCourses: Course[] = authoredRows.map(serializeCourse)

  return {
    user,
    stats: {
      enrollmentCount,
      certificateCount,
      authoredCount,
    },
    authoredCourses,
  }
}
