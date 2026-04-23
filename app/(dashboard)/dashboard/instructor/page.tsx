import Link from "next/link"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { Avatar } from "@/components/shared/Avatar"
import { RatingStars } from "@/components/shared/RatingStars"
import {
  MOCK_INSTRUCTOR_STATS,
  MOCK_COURSE_PERFORMANCE,
  MOCK_RECENT_ENROLLMENTS,
  MOCK_COURSE_DETAIL,
  formatPrice,
  formatRelativeTime,
} from "@/mock/data"

const stats = MOCK_INSTRUCTOR_STATS
const courses = MOCK_COURSE_PERFORMANCE
const recentEnrollments = MOCK_RECENT_ENROLLMENTS
const reviews = MOCK_COURSE_DETAIL.reviews

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-8">
      {/* ============================================================
          HEADER + CTA
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
          Instructor Dashboard
        </h2>
        <Link
          href="#"
          className="bg-primary hover:brightness-110 text-on-primary font-bold px-6 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined !text-sm">add</span>
          Create New Course
        </Link>
      </div>

      {/* ============================================================
          STATS ROW
          ============================================================ */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon="payments"
          trend={stats.totalRevenueChange}
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="group"
          trend={stats.totalStudentsChange}
        />
        <StatsCard
          title="Active Courses"
          value={stats.activeCourses}
          icon="menu_book"
        />
        <StatsCard
          title="Avg. Rating"
          value={stats.avgRating.toFixed(1)}
          icon="star"
        />
      </section>

      {/* ============================================================
          REVENUE CHART + RECENT ENROLLMENTS
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue chart */}
        <section className="lg:col-span-2 bg-surface-container border border-outline-variant p-6 lg:p-8 rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Revenue Insights</h3>
              <p className="text-sm text-on-surface-variant">Monthly earnings overview</p>
            </div>
            <span className="text-xs text-on-surface-variant px-3 py-1.5 bg-surface border border-outline-variant rounded-lg">
              Last 6 Months
            </span>
          </div>
          <RevenueChart data={stats.monthlyRevenue} />
        </section>

        {/* Recent enrollments */}
        <section className="bg-surface-container border border-outline-variant p-6 rounded-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Recent Enrollments</h3>
            <button className="text-primary text-xs hover:underline">View All</button>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={enrollment.avatarUrl} name={enrollment.studentName} size="sm" />
                  <div>
                    <div className="text-sm font-bold text-on-surface">{enrollment.studentName}</div>
                    <div className="text-[10px] text-on-surface-variant line-clamp-1">{enrollment.courseTitle}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs font-bold text-tertiary">
                    {enrollment.amount > 0 ? formatPrice(enrollment.amount) : "Free"}
                  </div>
                  <div className="text-[9px] text-on-surface-variant">
                    {formatRelativeTime(enrollment.enrolledAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ============================================================
          COURSE PERFORMANCE TABLE
          ============================================================ */}
      <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold">Course Performance</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-surface border border-outline-variant rounded text-xs hover:bg-surface-container-high transition-colors">
              Export CSV
            </button>
            <button className="px-3 py-1.5 bg-surface border border-outline-variant rounded text-xs hover:bg-surface-container-high transition-colors">
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-semibold">Course Name</th>
                <th className="px-6 py-4 font-semibold">Students</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Revenue</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {courses.map((course) => (
                <tr key={course.courseId} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined !text-sm">menu_book</span>
                      </div>
                      <span className="text-sm font-medium line-clamp-1">{course.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{course.studentCount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-primary !text-[14px]">star</span>
                      {course.rating > 0 ? course.rating.toFixed(1) : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {course.revenue > 0 ? formatPrice(course.revenue) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <CourseBadge
                      label={course.status === "PUBLISHED" ? "Published" : course.status === "DRAFT" ? "Draft" : "Pending"}
                      variant="status"
                      status={course.status}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined !text-lg">edit</span>
                      </button>
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined !text-lg">analytics</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================
          LATEST REVIEWS
          ============================================================ */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Latest Reviews</h3>
          <button className="text-on-surface-variant text-xs hover:text-primary transition-colors">
            Manage Reviews
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-surface-container border border-outline-variant p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={review.student.avatarUrl} name={review.student.fullName} size="sm" />
                <div>
                  <div className="text-sm font-bold">{review.student.fullName}</div>
                  <div className="text-[10px] text-on-surface-variant">
                    {formatRelativeTime(review.createdAt)}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <RatingStars rating={review.rating} size="sm" />
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-2 italic mb-4 leading-relaxed">
                &ldquo;{review.comment}&rdquo;
              </p>
              <button className="w-full py-2 bg-surface hover:bg-surface-container-high border border-outline-variant rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">
                Reply
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
