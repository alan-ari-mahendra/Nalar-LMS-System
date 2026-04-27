import { prisma } from "@/lib/db"

export async function getPayoutsByInstructor(instructorId: string) {
  return prisma.payout.findMany({
    where: { instructorId },
    orderBy: { requestedAt: "desc" },
  })
}

export async function getPendingPayouts() {
  return prisma.payout.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    include: {
      instructor: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })
}

export async function getAllPayouts() {
  return prisma.payout.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      instructor: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })
}
