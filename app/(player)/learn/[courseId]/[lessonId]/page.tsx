import { notFound, redirect } from "next/navigation"
import {
  getCourseWithCurriculum,
  getLessonProgressByUser,
  getQuizByLessonId,
  getDiscussionsByLesson,
} from "@/lib/queries"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import VideoPlayerPage from "./player-client"

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params

  const currentUser = await requireAuth()

  const course = await getCourseWithCurriculum(courseId)
  if (!course) notFound()

  const allLessons = course.chapters.flatMap((ch) => ch.lessons)
  const lesson = allLessons.find((l) => l.id === lessonId)
  if (!lesson) notFound()

  const isInstructorOrAdmin =
    currentUser.id === course.instructor.id || currentUser.role === "ADMIN"

  if (!isInstructorOrAdmin) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: currentUser.id, courseId } },
      select: { id: true },
    })
    if (!enrollment) {
      redirect(`/courses/${course.slug}`)
    }
  }

  const lessonProgress = await getLessonProgressByUser(currentUser.id, courseId)
  const quiz = lesson.type === "QUIZ" ? await getQuizByLessonId(lesson.id) : null
  const discussions = await getDiscussionsByLesson(lesson.id)

  return (
    <VideoPlayerPage
      course={course}
      lesson={lesson}
      lessonProgress={lessonProgress}
      quiz={quiz}
      discussions={discussions}
      currentUserId={currentUser.id}
      isInstructorOrAdmin={isInstructorOrAdmin}
    />
  )
}
