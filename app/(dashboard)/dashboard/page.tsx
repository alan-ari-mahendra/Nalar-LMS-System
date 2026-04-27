import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { ActivityFeedItem } from "@/components/dashboard/ActivityFeedItem"
import { ProgressBar } from "@/components/shared/ProgressBar"
import { requireAuth } from "@/lib/auth/guards"
import { getStudentStats, getCertificatesByUser, getEnrollmentsByUser, getNotificationsByUser, getFirstLessonId } from "@/lib/queries"

export default async function StudentDashboardPage() {
  const currentUser = await requireAuth()
  if (currentUser.role === "TEACHER") redirect("/dashboard/instructor")
  if (currentUser.role === "ADMIN") redirect("/dashboard/admin")

  const user = { fullName: currentUser.name ?? "Student" }
  const stats = await getStudentStats(currentUser.id)
  const allEnrollments = await getEnrollmentsByUser(currentUser.id)
  const enrollments = allEnrollments.filter((e) => e.progressPercent < 100)
  const firstLessonMap = new Map<string, string>()
  await Promise.all(
    enrollments.map(async (e) => {
      const lessonId = await getFirstLessonId(e.courseId)
      if (lessonId) firstLessonMap.set(e.courseId, lessonId)
    })
  )
  const certificates = await getCertificatesByUser(currentUser.id)
  const notifications = await getNotificationsByUser(currentUser.id)
  const activityItems = notifications.slice(0, 5).map((n) => ({
    id: n.id,
    type: n.type === "ENROLLMENT" ? "ENROLLED" as const
      : n.type === "CERTIFICATE_ISSUED" ? "CERTIFICATE_EARNED" as const
      : n.type === "QUIZ_PASSED" ? "QUIZ_PASSED" as const
      : "LESSON_COMPLETED" as const,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    metadata: (n.metadata as Record<string, string>) ?? {},
  }))
  return (
    <div className="space-y-10">
      {/* ============================================================
          1. GREETING
          ============================================================ */}
      <section>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">
          Welcome back, {user.fullName.split(" ")[0]} 👋
        </h2>
        <p className="text-on-surface-variant font-medium">
          {enrollments.length > 0 ? (
            <>You have <span className="text-primary">{enrollments.length} {enrollments.length === 1 ? "course" : "courses"}</span> in progress.</>
          ) : (
            <>You&apos;re all caught up! Browse courses to start learning.</>
          )}
        </p>
      </section>

      {/* ============================================================
          2. STATS ROW
          ============================================================ */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Courses Enrolled"
          value={stats.coursesEnrolled}
          icon="auto_stories"
        />
        <StatsCard
          title="Lessons Completed"
          value={stats.lessonsCompleted}
          icon="check_circle"
        />
        <StatsCard
          title="Certificates Earned"
          value={stats.certificatesEarned}
          icon="verified"
        />
        <StatsCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon="bolt"
          suffix="🔥"
        />
      </section>

      {/* ============================================================
          3. CONTINUE LEARNING
          ============================================================ */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">play_circle</span>
            Continue Learning
          </h3>
          <Link href="/dashboard/courses" className="text-sm font-bold text-primary hover:underline">
            View All Courses
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col sm:flex-row group"
            >
              <div className="w-full sm:w-48 h-32 sm:h-auto overflow-hidden relative shrink-0">
                <Image
                  src={enrollment.course.thumbnailUrl}
                  alt={enrollment.course.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-on-surface leading-tight line-clamp-2">
                    {enrollment.course.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {enrollment.course.instructor.fullName}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-on-surface-variant">Progress</span>
                    <span className="text-primary">{enrollment.progressPercent}%</span>
                  </div>
                  <ProgressBar value={enrollment.progressPercent} size="sm" />
                </div>
                <Link
                  href={
                    firstLessonMap.has(enrollment.courseId)
                      ? `/learn/${enrollment.courseId}/${firstLessonMap.get(enrollment.courseId)}`
                      : `/courses/${enrollment.course.slug}`
                  }
                  className="block w-full py-2 bg-primary hover:brightness-110 text-on-primary font-bold rounded-lg transition-all text-sm text-center"
                >
                  Continue
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          BOTTOM GRID: Certificates + Activity
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 4. MY CERTIFICATES */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">military_tech</span>
              My Certificates
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((cert, i) => (
              <div
                key={cert.id}
                className={`relative overflow-hidden p-6 rounded-2xl border flex flex-col justify-between h-48 group ${
                  i === 0
                    ? "bg-gradient-to-br from-primary-container/20 to-amber-500/10 border-primary/30"
                    : "bg-gradient-to-br from-surface-container-high/50 to-surface-container border-outline-variant"
                }`}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
                <div className="space-y-1 z-10">
                  <span className={`material-symbols-outlined ${i === 0 ? "text-amber-400" : "text-outline"}`}>
                    {i === 0 ? "workspace_premium" : "verified"}
                  </span>
                  <h4 className="text-lg font-bold text-on-surface">{cert.course.title}</h4>
                  <p className="text-xs text-on-surface-variant">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-2 z-10">
                  <Link
                    href={`/certificate/${cert.verifyCode}`}
                    className="flex-1 py-2 bg-surface-container/80 hover:bg-surface-container text-xs font-bold rounded-lg border border-outline-variant transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined !text-base">visibility</span> View
                  </Link>
                  <button
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      i === 0
                        ? "bg-primary hover:brightness-110 text-on-primary"
                        : "bg-secondary-container hover:bg-outline text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-base">download</span> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. RECENT ACTIVITY */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Recent Activity
            </h3>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6">
            <div className="divide-y divide-outline-variant">
              {activityItems.map((item) => (
                <ActivityFeedItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
