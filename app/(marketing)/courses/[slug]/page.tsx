import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/lib/queries"
import { getPendingOrderForCourse } from "@/lib/queries/order"
import { getCurrentUser } from "@/lib/auth/actions"
import { prisma } from "@/lib/db"
import CourseDetailPage from "./detail-client"

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()

  const user = await getCurrentUser()
  let enrolled = false
  let pendingOrderId: string | null = null

  if (user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: { id: true },
    })
    enrolled = !!enrollment

    if (!enrolled && !course.isFree && course.price > 0 && course.instructorId !== user.id) {
      const pending = await getPendingOrderForCourse(user.id, course.id)
      pendingOrderId = pending?.id ?? null
    }
  }

  return (
    <CourseDetailPage
      course={course}
      enrolled={enrolled}
      pendingOrderId={pendingOrderId}
    />
  )
}
