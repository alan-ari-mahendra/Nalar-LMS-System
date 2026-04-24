"use client"

export default function InstructorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <span className="material-symbols-outlined !text-5xl text-error mb-4">error</span>
      <h2 className="text-xl font-bold text-on-surface mb-2">Dashboard error</h2>
      <p className="text-sm text-on-surface-variant mb-6 text-center max-w-md">
        {error.message || "Failed to load instructor dashboard."}
      </p>
      <button
        onClick={reset}
        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all"
      >
        Try Again
      </button>
    </div>
  )
}
