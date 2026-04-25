import { prisma } from "@/lib/db"
import { serializeLessonProgress } from "@/lib/serializers"
import type { LessonProgress } from "@/type"

/** Get lesson progress for a user on a specific course */
export async function getLessonProgressByUser(userId: string, courseId: string): Promise<LessonProgress[]> {
  const chapters = await prisma.chapter.findMany({
    where: { courseId, deletedAt: null },
    select: {
      lessons: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
  })
  const lessonIds = chapters.flatMap((ch) => ch.lessons.map((l) => l.id))

  const rows = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds } },
  })
  return rows.map(serializeLessonProgress)
}

/** Get first lesson ID for a course (by chapter + lesson position) */
export async function getFirstLessonId(courseId: string): Promise<string | null> {
  const chapter = await prisma.chapter.findFirst({
    where: { courseId, deletedAt: null },
    orderBy: { position: "asc" },
    select: {
      lessons: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        take: 1,
        select: { id: true },
      },
    },
  })
  return chapter?.lessons[0]?.id ?? null
}

/** Get a single lesson by ID */
export async function getLessonById(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        select: { courseId: true },
      },
    },
  })
}
