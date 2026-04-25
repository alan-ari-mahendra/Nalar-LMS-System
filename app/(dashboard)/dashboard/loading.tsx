export default function DashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Greeting */}
      <section className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-64" />
        <div className="h-4 bg-surface-container-high rounded w-48" />
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-3">
            <div className="h-4 bg-surface-container-high rounded w-24" />
            <div className="h-8 bg-surface-container-high rounded w-16" />
          </div>
        ))}
      </section>

      {/* Continue learning */}
      <section className="space-y-6">
        <div className="h-6 bg-surface-container-high rounded w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col sm:flex-row">
              <div className="w-full sm:w-48 h-32 bg-surface-container-high" />
              <div className="flex-1 p-5 space-y-4">
                <div className="h-5 bg-surface-container-high rounded w-3/4" />
                <div className="h-3 bg-surface-container-high rounded w-1/2" />
                <div className="h-2 bg-surface-container-high rounded w-full" />
                <div className="h-10 bg-surface-container-high rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-surface-container-high rounded w-36" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-48 bg-surface-container border border-outline-variant rounded-2xl" />
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <div className="h-6 bg-surface-container-high rounded w-32" />
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface-container-high rounded" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
