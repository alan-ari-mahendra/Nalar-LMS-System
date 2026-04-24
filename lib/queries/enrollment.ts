import { prisma } from "@/lib/db"
import { serializeEnrollment } from "@/lib/serializers"
import type { Enrollment } from "@/type"

/** Get enrollments for a student with course data */
export async function getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
  const rows = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })
  return rows.map(serializeEnrollment)
}

/** Get recent enrollments for an instructor's courses */
export async function getRecentEnrollmentsByInstructor(instructorId: string, limit = 5) {
  return prisma.enrollment.findMany({
    where: { course: { instructorId } },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: { select: { id: true, title: true, price: true } },
    },
    orderBy: { enrolledAt: "desc" },
    take: limit,
  })
}
