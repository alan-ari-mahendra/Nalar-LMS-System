export default function RevenueLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <header className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-40" />
        <div className="h-4 bg-surface-container-high rounded w-64" />
      </header>

      {/* Stats skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-3"
          >
            <div className="h-4 bg-surface-container-high rounded w-24" />
            <div className="h-8 bg-surface-container-high rounded w-32" />
          </div>
        ))}
      </section>

      {/* Chart skeleton */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-6 lg:p-8">
        <div className="h-6 bg-surface-container-high rounded w-40 mb-8" />
        <div className="h-[300px] bg-surface-container-high rounded" />
      </section>

      {/* Per-course skeleton */}
      <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <div className="h-5 bg-surface-container-high rounded w-40" />
        </div>
        <div className="divide-y divide-outline-variant">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6">
              <div className="h-4 bg-surface-container-high rounded flex-1 max-w-md" />
              <div className="h-4 bg-surface-container-high rounded w-16" />
              <div className="h-4 bg-surface-container-high rounded w-24" />
              <div className="h-4 bg-surface-container-high rounded w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Transactions skeleton */}
      <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <div className="h-5 bg-surface-container-high rounded w-48" />
        </div>
        <div className="divide-y divide-outline-variant">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-surface-container-high" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-surface-container-high rounded w-32" />
                <div className="h-3 bg-surface-container-high rounded w-48" />
              </div>
              <div className="h-4 bg-surface-container-high rounded w-20" />
              <div className="h-6 bg-surface-container-high rounded w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
