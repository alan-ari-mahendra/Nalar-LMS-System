import { prisma } from "@/lib/db"

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function fmtDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function getPlatformAnalytics() {
  const now = new Date()
  const start = startOfDay(new Date(now.getTime() - 30 * DAY_MS))

  const [usersByRole, completedOrders, enrollments, courseStatusGroups, totals] =
    await Promise.all([
      prisma.user.groupBy({
        by: ["role"],
        where: { deletedAt: null, isActive: true },
        _count: { _all: true },
      }),
      prisma.order.findMany({
        where: { status: "COMPLETED", paidAt: { gte: start } },
        select: { amount: true, paidAt: true },
        orderBy: { paidAt: "asc" },
      }),
      prisma.enrollment.findMany({
        where: { enrolledAt: { gte: start } },
        select: { enrolledAt: true },
        orderBy: { enrolledAt: "asc" },
      }),
      prisma.course.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      Promise.all([
        prisma.user.count({ where: { deletedAt: null, isActive: true } }),
        prisma.course.count({ where: { deletedAt: null } }),
        prisma.enrollment.count(),
        prisma.order.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
      ]),
    ])

  // Build day buckets
  const days: { day: string; revenue: number; enrollments: number }[] = []
  for (let i = 0; i <= 30; i++) {
    const d = new Date(start.getTime() + i * DAY_MS)
    days.push({ day: fmtDay(d), revenue: 0, enrollments: 0 })
  }

  for (const o of completedOrders) {
    if (!o.paidAt) continue
    const key = fmtDay(startOfDay(o.paidAt))
    const bucket = days.find((b) => b.day === key)
    if (bucket) bucket.revenue += Number(o.amount)
  }
  for (const e of enrollments) {
    const key = fmtDay(startOfDay(e.enrolledAt))
    const bucket = days.find((b) => b.day === key)
    if (bucket) bucket.enrollments += 1
  }

  const [totalUsers, totalCourses, totalEnrollments, revenueAgg] = totals
  const totalRevenue = Number(revenueAgg._sum.amount ?? 0)

  return {
    summary: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
    },
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
    courseStatus: courseStatusGroups.map((c) => ({ status: c.status, count: c._count._all })),
    dailyTrend: days,
  }
}
