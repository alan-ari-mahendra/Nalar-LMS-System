"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { approveCourse, rejectCourse } from "@/lib/actions/admin"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { formatPrice, formatRelativeTime } from "@/lib/utils"
import type { CourseStatus } from "@/type"

interface CourseRow {
  id: string
  title: string
  thumbnailUrl: string
  status: string
  level: string
  price: number
  enrollmentCount: number
  createdAt: string
  instructorName: string
}

type StatusFilter = "ALL" | "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED"

export function AdminCoursesTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<StatusFilter>("ALL")
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const filtered = filter === "ALL" ? courses : courses.filter((c) => c.status === filter)

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Draft", value: "DRAFT" },
    { label: "Pending", value: "PENDING_REVIEW" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Archived", value: "ARCHIVED" },
  ]

  function handleApprove(courseId: string) {
    startTransition(async () => {
      await approveCourse({ courseId })
      router.refresh()
    })
  }

  function handleReject(courseId: string) {
    if (rejectReason.length < 5) return
    startTransition(async () => {
      await rejectCourse({ courseId, reason: rejectReason })
      setRejectingId(null)
      setRejectReason("")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {statusFilters.map((sf) => (
          <button key={sf.value} onClick={() => setFilter(sf.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === sf.value ? "bg-primary text-on-primary" : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}>
            {sf.label}
          </button>
        ))}
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
              <th className="px-5 py-3 font-semibold">Course</th>
              <th className="px-5 py-3 font-semibold">Instructor</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Students</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-surface-variant/30 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-sm font-medium line-clamp-1">{course.title}</span>
                </td>
                <td className="px-5 py-3 text-sm text-on-surface-variant">{course.instructorName}</td>
                <td className="px-5 py-3">
                  <CourseBadge label={course.status === "PUBLISHED" ? "Published" : course.status === "DRAFT" ? "Draft" : course.status === "PENDING_REVIEW" ? "Pending" : "Archived"} variant="status" status={course.status as CourseStatus} />
                </td>
                <td className="px-5 py-3 text-sm">{course.enrollmentCount}</td>
                <td className="px-5 py-3 text-sm">{formatPrice(course.price)}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {course.status !== "PUBLISHED" && (
                      <button onClick={() => handleApprove(course.id)} disabled={isPending}
                        className="text-xs font-bold text-tertiary hover:bg-tertiary-container px-3 py-1.5 rounded transition-colors disabled:opacity-50">
                        Approve
                      </button>
                    )}
                    {rejectingId === course.id ? (
                      <div className="flex items-center gap-1">
                        <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (min 5 chars)"
                          className="bg-surface-container-low border border-outline-variant rounded px-2 py-1 text-xs w-40" />
                        <button onClick={() => handleReject(course.id)} disabled={isPending || rejectReason.length < 5}
                          className="text-xs font-bold text-error px-2 py-1 disabled:opacity-50">Send</button>
                        <button onClick={() => setRejectingId(null)} className="text-xs text-on-surface-variant px-1">×</button>
                      </div>
                    ) : (
                      course.status !== "DRAFT" && (
                        <button onClick={() => setRejectingId(course.id)} disabled={isPending}
                          className="text-xs font-bold text-error hover:bg-error-container px-3 py-1.5 rounded transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
