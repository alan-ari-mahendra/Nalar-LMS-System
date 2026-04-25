"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ProgressBar } from "@/components/shared/ProgressBar"
import type { EnrollmentWithNext } from "@/lib/actions/enrollment"

type Tab = "all" | "in_progress" | "completed"

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

interface MyCoursesClientProps {
  enrollments: EnrollmentWithNext[]
}

export function MyCoursesClient({ enrollments }: MyCoursesClientProps) {
  const [tab, setTab] = useState<Tab>("all")

  const filtered = useMemo(() => {
    if (tab === "in_progress") {
      return enrollments.filter((e) => e.progressPercent > 0 && e.progressPercent < 100)
    }
    if (tab === "completed") {
      return enrollments.filter((e) => e.progressPercent === 100)
    }
    return enrollments
  }, [enrollments, tab])

  const counts = useMemo(
    () => ({
      all: enrollments.length,
      in_progress: enrollments.filter((e) => e.progressPercent > 0 && e.progressPercent < 100).length,
      completed: enrollments.filter((e) => e.progressPercent === 100).length,
    }),
    [enrollments]
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">My Courses</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Track your enrollments and continue learning.
          </p>
        </div>
        <span className="px-3 py-1 bg-primary/15 text-primary text-sm font-bold rounded-full border border-primary/30">
          {counts.all} {counts.all === 1 ? "course" : "courses"}
        </span>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-outline-variant">
        {tabs.map((t) => {
          const active = tab === t.value
          const count = counts[t.value]
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`relative px-4 py-3 text-sm font-bold transition-colors ${
                active
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="flex items-center gap-2">
                {t.label}
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded ${
                    active ? "bg-primary/20 text-primary" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {count}
                </span>
              </span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
              )}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((e) => (
            <EnrollmentCard key={e.id} enrollment={e} />
          ))}
        </div>
      )}
    </div>
  )
}

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentWithNext }) {
  const isCompleted = enrollment.progressPercent === 100
  const continueHref = enrollment.nextLessonId
    ? `/learn/${enrollment.courseId}/${enrollment.nextLessonId}`
    : `/courses/${enrollment.course.slug}`

  return (
    <div className="group bg-surface-container border border-outline-variant rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={enrollment.course.thumbnailUrl}
          alt={enrollment.course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isCompleted && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-tertiary-container text-tertiary text-xs font-bold rounded flex items-center gap-1">
            <span className="material-symbols-outlined !text-sm">verified</span>
            Completed
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="text-base font-bold text-on-surface line-clamp-2">
            {enrollment.course.title}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {enrollment.course.instructor.fullName}
          </p>
        </div>

        <div className="space-y-1.5 mt-auto">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-on-surface-variant">Progress</span>
            <span className="text-primary">{enrollment.progressPercent}%</span>
          </div>
          <ProgressBar value={enrollment.progressPercent} size="sm" />
        </div>

        <Link
          href={continueHref}
          className="w-full mt-2 py-2 bg-primary text-on-primary font-bold rounded-lg text-sm text-center hover:brightness-110 transition-all"
        >
          {isCompleted ? "Review" : enrollment.progressPercent > 0 ? "Continue" : "Start Learning"}
        </Link>
      </div>
    </div>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  const message = {
    all: "You haven't enrolled in any courses yet.",
    in_progress: "No courses currently in progress.",
    completed: "No completed courses yet — keep learning!",
  }[tab]

  return (
    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
      <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">menu_book</span>
      <p className="text-sm mb-6 text-center max-w-sm">{message}</p>
      <Link
        href="/courses"
        className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:brightness-110 transition-all"
      >
        Browse Courses
      </Link>
    </div>
  )
}
