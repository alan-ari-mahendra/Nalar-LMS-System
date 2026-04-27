import { notFound } from "next/navigation"
import {
  getCourseWithCurriculum,
  getLessonProgressByUser,
  getQuizByLessonId,
  getDiscussionsByLesson,
} from "@/lib/queries"
import { getCurrentUser } from "@/lib/auth/actions"
import VideoPlayerPage from "./player-client"

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params

  const course = await getCourseWithCurriculum(courseId)
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

  const quiz = lesson.type === "QUIZ" ? await getQuizByLessonId(lesson.id) : null
  const discussions = await getDiscussionsByLesson(lesson.id)

  const isInstructorOrAdmin = currentUser
    ? currentUser.id === course.instructor.id || currentUser.role === "ADMIN"
    : false

  return (
    <VideoPlayerPage
      course={course}
      lesson={lesson}
      lessonProgress={lessonProgress}
      quiz={quiz}
      discussions={discussions}
      currentUserId={currentUser?.id ?? null}
      isInstructorOrAdmin={isInstructorOrAdmin}
    />
  )
}
