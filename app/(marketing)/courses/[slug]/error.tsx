"use client"

import Link from "next/link"

export default function CourseDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <span className="material-symbols-outlined !text-5xl text-error mb-4">error</span>
      <h2 className="text-xl font-bold text-on-surface mb-2">Failed to load course</h2>
      <p className="text-sm text-on-surface-variant mb-6 text-center max-w-md">
        {error.message || "Something went wrong while loading this course."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all"
        >
          Try Again
        </button>
        <Link
          href="/courses"
          className="border border-outline-variant bg-surface-container text-on-surface px-6 py-2.5 rounded-lg font-bold hover:bg-surface-container-high transition-all"
        >
          Back to Catalog
        </Link>
      </div>
    </div>
  )
}
