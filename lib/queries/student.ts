import { prisma } from "@/lib/db"
import { serializeCertificate } from "@/lib/serializers"
import type { Certificate, StudentStats } from "@/type"

/** Get student dashboard stats */
export async function getStudentStats(userId: string): Promise<StudentStats> {
  const [coursesEnrolled, lessonsCompleted, certificatesEarned] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
    prisma.certificate.count({ where: { userId } }),
  ])

  return {
    coursesEnrolled,
    lessonsCompleted,
    certificatesEarned,
    currentStreak: 0,
  }
}

/** Get student certificates with course + instructor data */
export async function getCertificatesByUser(userId: string): Promise<Certificate[]> {
  const rows = await prisma.certificate.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  })
  return rows.map(serializeCertificate)
}

/** Get student notifications */
export async function getNotificationsByUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}
