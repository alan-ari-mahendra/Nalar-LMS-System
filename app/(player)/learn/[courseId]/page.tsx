import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCourseWithCurriculum, getFirstLessonId } from "@/lib/queries"

export default async function CourseEntryPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const lessonId = await getFirstLessonId(courseId)
  if (lessonId) redirect(`/learn/${courseId}/${lessonId}`)

  const course = await getCourseWithCurriculum(courseId)
  if (!course) notFound()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center">
      <span className="material-symbols-outlined !text-6xl text-on-surface-variant opacity-40 mb-4">
        menu_book
      </span>
      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
        {course.title}
      </span>
      <h1 className="text-2xl font-bold text-on-surface mb-2">No lessons yet</h1>
      <p className="text-on-surface-variant mb-6 max-w-md text-sm">
        This course doesn&apos;t have any published lessons. Check back soon —
        new content is on the way.
      </p>
      <div className="flex gap-3">
        <Link
          href={`/courses/${course.slug}`}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
        >
          Back to Course
        </Link>
        <Link
          href="/courses"
          className="border border-outline-variant bg-surface-container text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-high transition-all"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  )
}
