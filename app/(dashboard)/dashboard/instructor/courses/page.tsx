import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { getCurrentUser } from "@/lib/auth/actions"
import { getInstructorStats } from "@/lib/queries"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { formatPrice } from "@/lib/utils"

export default async function InstructorCoursesPage() {
  await requireRole(["TEACHER", "ADMIN"])
  const user = await getCurrentUser()
  if (!user) return null

  const stats = await getInstructorStats(user.id)
  const courses = stats.coursePerformance

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">My Courses</h2>
        <Link
          href="/dashboard/instructor/courses/new"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined !text-sm">add</span>
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">menu_book</span>
          <p className="text-sm">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Link
              key={course.courseId}
              href={`/dashboard/instructor/courses/${course.courseId}`}
              className="bg-surface-container border border-outline-variant rounded-xl p-5 flex items-center gap-5 hover:border-primary/50 transition-all group"
            >
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-outline !text-2xl">menu_book</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">{course.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-on-surface-variant">
                  <span>{course.studentCount} students</span>
                  <span>·</span>
                  <span>{course.rating > 0 ? `${course.rating.toFixed(1)} rating` : "No ratings"}</span>
                  <span>·</span>
                  <span>{formatPrice(course.revenue)}</span>
                </div>
              </div>
              <CourseBadge
                label={course.status === "PUBLISHED" ? "Published" : course.status === "DRAFT" ? "Draft" : course.status === "ARCHIVED" ? "Archived" : "Pending"}
                variant="status"
                status={course.status}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
