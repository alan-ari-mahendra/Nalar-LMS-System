export default function ReviewsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="flex justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-surface-container-high rounded w-40" />
          <div className="h-4 bg-surface-container-high rounded w-64" />
        </div>
        <div className="h-12 bg-surface-container-high rounded-xl w-44" />
      </header>

      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 bg-surface-container-high rounded-lg w-16" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-surface-container-high rounded w-32" />
                <div className="h-3 bg-surface-container-high rounded w-24" />
                <div className="h-3 bg-surface-container-high rounded w-40" />
              </div>
            </div>
            <div className="h-4 bg-surface-container-high rounded w-32" />
            <div className="h-3 bg-surface-container-high rounded w-full" />
            <div className="h-3 bg-surface-container-high rounded w-3/4" />
            <div className="h-7 bg-surface-container-high rounded-lg w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
