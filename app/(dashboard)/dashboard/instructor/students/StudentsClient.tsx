"use client"

import { useMemo, useState } from "react"
import { Avatar } from "@/components/shared/Avatar"
import { ProgressBar } from "@/components/shared/ProgressBar"
import type { InstructorStudent } from "@/lib/actions/instructor"

interface StudentsClientProps {
  enrollments: InstructorStudent[]
}

export function StudentsClient({ enrollments }: StudentsClientProps) {
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>()
    enrollments.forEach((e) => map.set(e.course.id, e.course.title))
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }))
  }, [enrollments])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enrollments.filter((e) => {
      if (courseFilter !== "all" && e.course.id !== courseFilter) return false
      if (!q) return true
      return (
        e.student.name.toLowerCase().includes(q) ||
        e.student.email.toLowerCase().includes(q)
      )
    })
  }, [enrollments, search, courseFilter])

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Students</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Everyone enrolled in your courses.
          </p>
        </div>
        <span className="px-3 py-1 bg-primary/15 text-primary text-sm font-bold rounded-full border border-primary/30">
          {enrollments.length} {enrollments.length === 1 ? "student" : "students"}
        </span>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline !text-lg">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
        >
          <option value="all">All Courses</option>
          {courseOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState hasAny={enrollments.length > 0} />
      ) : (
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Enrolled</th>
                <th className="px-6 py-4 font-semibold w-64">Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((e) => (
                <tr key={e.enrollmentId} className="hover:bg-surface-container-high/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={e.student.avatarUrl} name={e.student.name} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-on-surface truncate">
                          {e.student.name}
                        </div>
                        <div className="text-xs text-on-surface-variant truncate">
                          {e.student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface line-clamp-1 max-w-xs">
                    {e.course.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(e.enrolledAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={e.progressPercent} size="sm" />
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0 w-10 text-right">
                        {e.progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge progressPercent={e.progressPercent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ progressPercent }: { progressPercent: number }) {
  if (progressPercent === 100) {
    return (
      <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-tertiary-container text-tertiary">
        Completed
      </span>
    )
  }
  if (progressPercent > 0) {
    return (
      <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-primary/20 text-primary">
        In Progress
      </span>
    )
  }
  return (
    <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-secondary-container text-on-secondary-container">
      Not Started
    </span>
  )
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
      <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">group</span>
      <p className="text-sm">
        {hasAny ? "No students match your filters." : "No students enrolled yet."}
      </p>
    </div>
  )
}
