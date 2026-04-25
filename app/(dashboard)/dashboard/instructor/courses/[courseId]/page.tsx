import { notFound } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"
import { getCurrentUser } from "@/lib/auth/actions"
import { getCategories } from "@/lib/queries"
import { prisma } from "@/lib/db"
import { CourseEditor } from "./edit-client"

export default async function EditCoursePage({
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
          },
        },
      },
      category: { select: { id: true, name: true } },
    },
  })

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    notFound()
  }

  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CourseEditor
        course={{
          id: course.id,
          title: course.title,
          description: course.description,
          shortDesc: course.shortDesc,
          price: Number(course.price),
          level: course.level,
          status: course.status,
          categoryId: course.categoryId,
          thumbnailUrl: course.thumbnailUrl,
          totalLessons: course.totalLessons,
          totalDuration: course.totalDuration,
          chapters: course.chapters.map((ch) => ({
            id: ch.id,
            title: ch.title,
            description: ch.description,
            position: ch.position,
            lessons: ch.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              type: l.type,
              duration: l.duration,
              position: l.position,
            })),
          })),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
