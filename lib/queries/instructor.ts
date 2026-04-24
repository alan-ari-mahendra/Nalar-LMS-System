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

  return {
    totalRevenue,
    totalRevenueChange: 0,
    totalStudents,
    totalStudentsChange: 0,
    activeCourses: publishedCourses.length,
    avgRating: Math.round(avgRating * 100) / 100,
    monthlyRevenue: [] as { month: string; revenue: number }[],
    coursePerformance,
  }
}
