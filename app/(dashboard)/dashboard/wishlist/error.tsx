"use client"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-12 text-center">
      <span className="material-symbols-outlined text-error !text-5xl">error</span>
      <h2 className="text-xl font-bold mt-3">Something went wrong</h2>
      <p className="text-on-surface-variant text-sm mt-1">Could not load your wishlist.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm"
      >
        Try again
      </button>
    </div>
  )
}
