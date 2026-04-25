import { prisma } from "@/lib/db"

/** Get instructor dashboard stats */
export async function getInstructorStats(instructorId: string) {
  const courses = await prisma.course.findMany({
    where: { instructorId, deletedAt: null },
    select: {
      id: true,
      title: true,
      thumbnailUrl: true,
      status: true,
      rating: true,
      reviewCount: true,
      enrollmentCount: true,
      price: true,
    },
  })

  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED")
  const totalStudents = courses.reduce((sum, c) => sum + c.enrollmentCount, 0)
  const avgRating =
    publishedCourses.length > 0
      ? publishedCourses.reduce((sum, c) => sum + c.rating, 0) / publishedCourses.length
      : 0

  // Calculate revenue from completed orders
  const revenueResult = await prisma.order.aggregate({
    where: { course: { instructorId }, status: "COMPLETED" },
    _sum: { amount: true },
  })
  const totalRevenue = revenueResult._sum.amount
    ? Number(revenueResult._sum.amount)
    : 0

  // Course performance data
  const coursePerformance = courses.map((c) => ({
    courseId: c.id,
    title: c.title,
    thumbnailUrl: c.thumbnailUrl,
    studentCount: c.enrollmentCount,
    rating: c.rating,
    revenue: Number(c.price) * c.enrollmentCount, // approximate
    status: c.status,
  }))

  // Monthly revenue aggregation (last 12 months)
  const monthlyRevenue = await prisma.$queryRaw<
    { month: string; revenue: number }[]
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', o."createdAt"), 'YYYY-MM') AS month,
      SUM(o."amount")::float AS revenue
    FROM "orders" o
    JOIN "courses" c ON o."courseId" = c."id"
    WHERE c."instructorId" = ${instructorId}
      AND o."status" = 'COMPLETED'
      AND o."createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', o."createdAt")
    ORDER BY month ASC
  `

  return {
    totalRevenue,
    totalRevenueChange: 0,
    totalStudents,
    totalStudentsChange: 0,
    activeCourses: publishedCourses.length,
    avgRating: Math.round(avgRating * 100) / 100,
    monthlyRevenue,
    coursePerformance,
  }
}

/** Get latest reviews across all instructor's courses */
export async function getReviewsByInstructor(instructorId: string, limit = 6) {
  const rows = await prisma.review.findMany({
    where: { course: { instructorId } },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    student: {
      id: r.user.id,
      fullName: r.user.name ?? "",
      avatarUrl: r.user.avatarUrl,
    },
  }))
}
