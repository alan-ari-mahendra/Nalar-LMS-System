import { notFound } from "next/navigation"
import { getCourseBySlug, getLessonById, getLessonProgressByUser } from "@/lib/queries"
import { getCurrentUser } from "@/lib/auth/actions"
import { prisma } from "@/lib/db"
import VideoPlayerPage from "./player-client"

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params

  // Get course by ID, find its slug first
  const courseRow = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  })
  if (!courseRow) notFound()

  const course = await getCourseBySlug(courseRow.slug)
  if (!course) notFound()

  // Find the requested lesson
  const allLessons = course.chapters.flatMap((ch) => ch.lessons)
  const lesson = allLessons.find((l) => l.id === lessonId)
  if (!lesson) notFound()

  // Get progress for current user
  const currentUser = await getCurrentUser()
  const lessonProgress = currentUser
    ? await getLessonProgressByUser(currentUser.id, courseId)
    : []

  return (
    <VideoPlayerPage
      course={course}
      lesson={lesson}
      lessonProgress={lessonProgress}
    />
  )
}
