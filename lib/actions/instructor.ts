"use server"

import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"

export interface InstructorStudent {
  enrollmentId: string
  enrolledAt: string
  progressPercent: number
  student: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string
  }
}

export async function getInstructorStudents(): Promise<InstructorStudent[]> {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const rows = await prisma.enrollment.findMany({
    where: { course: { instructorId: user.id, deletedAt: null } },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      course: {
        select: { id: true, title: true, slug: true, thumbnailUrl: true },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  return rows.map((r) => ({
    enrollmentId: r.id,
    enrolledAt: r.enrolledAt.toISOString(),
    progressPercent: r.progressPercent,
    student: {
      id: r.user.id,
      name: r.user.name ?? "Student",
      email: r.user.email,
      avatarUrl: r.user.avatarUrl,
    },
    course: {
      id: r.course.id,
      title: r.course.title,
      slug: r.course.slug,
      thumbnailUrl: r.course.thumbnailUrl,
    },
  }))
}

export interface InstructorOrder {
  id: string
  amount: number
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  createdAt: string
  paidAt: string | null
  student: {
    id: string
    name: string
    avatarUrl: string | null
  }
  course: {
    id: string
    title: string
  }
}

export interface CourseRevenue {
  courseId: string
  title: string
  thumbnailUrl: string
  studentCount: number
  revenue: number
  avgOrder: number
}

export interface InstructorRevenueData {
  totalRevenue: number
  thisMonthRevenue: number
  totalOrders: number
  monthlyBreakdown: { month: string; revenue: number }[]
  perCourse: CourseRevenue[]
  recentOrders: InstructorOrder[]
}

export async function getInstructorRevenue(): Promise<InstructorRevenueData> {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const ownedCourses = await prisma.course.findMany({
    where: { instructorId: user.id, deletedAt: null },
    select: { id: true, title: true, thumbnailUrl: true },
  })
  const courseIds = ownedCourses.map((c) => c.id)

  if (courseIds.length === 0) {
    return {
      totalRevenue: 0,
      thisMonthRevenue: 0,
      totalOrders: 0,
      monthlyBreakdown: [],
      perCourse: [],
      recentOrders: [],
    }
  }

  const completedWhere = {
    courseId: { in: courseIds },
    status: "COMPLETED" as const,
  }

  const [totalAgg, totalOrders, recentOrdersRaw, perCourseAgg] = await Promise.all([
    prisma.order.aggregate({
      where: completedWhere,
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { courseId: { in: courseIds } } }),
    prisma.order.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ["courseId"],
      where: completedWhere,
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ])

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const thisMonthAgg = await prisma.order.aggregate({
    where: { ...completedWhere, paidAt: { gte: startOfMonth } },
    _sum: { amount: true },
  })

  const monthlyBreakdown = await prisma.$queryRaw<
    { month: string; revenue: number }[]
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', o."createdAt"), 'Mon') AS month,
      SUM(o."amount")::float AS revenue
    FROM "orders" o
    WHERE o."courseId" = ANY(${courseIds})
      AND o."status" = 'COMPLETED'
      AND o."createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', o."createdAt")
    ORDER BY DATE_TRUNC('month', o."createdAt") ASC
  `

  const perCourseMap = new Map(
    perCourseAgg.map((p) => [
      p.courseId,
      {
        revenue: p._sum.amount ? Number(p._sum.amount) : 0,
        orderCount: p._count._all,
      },
    ])
  )

  const enrollmentCounts = await prisma.enrollment.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds } },
    _count: { _all: true },
  })
  const enrollmentMap = new Map(enrollmentCounts.map((e) => [e.courseId, e._count._all]))

  const perCourse: CourseRevenue[] = ownedCourses.map((c) => {
    const agg = perCourseMap.get(c.id)
    const revenue = agg?.revenue ?? 0
    const orderCount = agg?.orderCount ?? 0
    return {
      courseId: c.id,
      title: c.title,
      thumbnailUrl: c.thumbnailUrl,
      studentCount: enrollmentMap.get(c.id) ?? 0,
      revenue,
      avgOrder: orderCount > 0 ? revenue / orderCount : 0,
    }
  })

  return {
    totalRevenue: totalAgg._sum.amount ? Number(totalAgg._sum.amount) : 0,
    thisMonthRevenue: thisMonthAgg._sum.amount ? Number(thisMonthAgg._sum.amount) : 0,
    totalOrders,
    monthlyBreakdown,
    perCourse,
    recentOrders: recentOrdersRaw.map((o) => ({
      id: o.id,
      amount: Number(o.amount),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt?.toISOString() ?? null,
      student: {
        id: o.user.id,
        name: o.user.name ?? "Student",
        avatarUrl: o.user.avatarUrl,
      },
      course: { id: o.course.id, title: o.course.title },
    })),
  }
}
