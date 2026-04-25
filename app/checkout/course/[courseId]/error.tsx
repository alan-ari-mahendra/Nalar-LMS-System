"use client"

import Link from "next/link"

export default function CheckoutCourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <span className="material-symbols-outlined !text-5xl text-error mb-4">error</span>
      <h2 className="text-xl font-bold text-on-surface mb-2">Could not load checkout</h2>
      <p className="text-sm text-on-surface-variant mb-6 text-center max-w-md">
        {error.message || "Something went wrong loading the checkout page."}
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
          className="border border-outline-variant px-6 py-2.5 rounded-lg font-bold text-on-surface hover:bg-surface-container transition-all"
        >
          Back to courses
        </Link>
      </div>
    </div>
  )
}
