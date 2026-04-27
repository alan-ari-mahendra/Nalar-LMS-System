import { notFound } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"
import { getCurrentUser } from "@/lib/auth/actions"
import { prisma } from "@/lib/db"
import { BuilderClient } from "./builder-client"
import type { BuilderCourse } from "@/components/builder/types"

export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  await requireRole(["TEACHER", "ADMIN"])
  const user = await getCurrentUser()
  if (!user) return null

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    include: {
      chapters: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
            include: {
              quiz: {
                include: {
                  questions: {
                    orderBy: { position: "asc" },
                    include: { options: { orderBy: { position: "asc" } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    notFound()
  }

  const builderCourse: BuilderCourse = {
    id: course.id,
    title: course.title,
    description: course.description,
    shortDesc: course.shortDesc,
    price: Number(course.price),
    level: course.level,
    status: course.status,
    categoryId: course.categoryId,
    thumbnailUrl: course.thumbnailUrl,
    chapters: course.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      position: ch.position,
      lessons: ch.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        type: l.type,
        position: l.position,
        duration: l.duration,
        videoUrl: l.videoUrl,
        content: l.content,
        quiz: l.quiz
          ? {
              id: l.quiz.id,
              title: l.quiz.title,
              passingScore: l.quiz.passingScore,
              allowRetake: l.quiz.allowRetake,
              questions: l.quiz.questions.map((q) => ({
                id: q.id,
                text: q.text,
                explanation: q.explanation,
                position: q.position,
                points: q.points,
                options: q.options.map((o) => ({
                  id: o.id,
                  text: o.text,
                  isCorrect: o.isCorrect,
                  position: o.position,
                })),
              })),
            }
          : null,
      })),
    })),
  }

  return (
    <div className="max-w-7xl mx-auto">
      <BuilderClient course={builderCourse} />
    </div>
  )
}
