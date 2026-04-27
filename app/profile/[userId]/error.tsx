"use client"

import Link from "next/link"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-12 text-center max-w-md w-full">
        <span className="material-symbols-outlined text-error !text-5xl">error</span>
        <h2 className="text-xl font-bold mt-3">Profile unavailable</h2>
        <p className="text-on-surface-variant text-sm mt-1">Could not load this profile.</p>
        <div className="flex items-center gap-2 justify-center mt-4">
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-outline-variant px-4 py-2 rounded-lg font-bold text-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
