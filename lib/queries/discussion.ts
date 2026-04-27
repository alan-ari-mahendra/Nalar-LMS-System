import { prisma } from "@/lib/db"

export async function getDiscussionsByLesson(lessonId: string) {
  return prisma.discussion.findMany({
    where: { lessonId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, role: true } },
      replies: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      },
    },
  })
}

export type DiscussionWithReplies = Awaited<ReturnType<typeof getDiscussionsByLesson>>[number]
