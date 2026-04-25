export default function InstructorDashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-7 bg-surface-container-high rounded w-52" />
        <div className="h-10 bg-surface-container-high rounded-lg w-40" />
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-3">
            <div className="h-4 bg-surface-container-high rounded w-24" />
            <div className="h-8 bg-surface-container-high rounded w-20" />
          </div>
        ))}
      </section>

      {/* Chart + enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl p-8">
          <div className="h-6 bg-surface-container-high rounded w-36 mb-8" />
          <div className="h-64 bg-surface-container-high rounded" />
        </div>
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-5">
          <div className="h-5 bg-surface-container-high rounded w-36" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-container-high rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-surface-container-high rounded w-24" />
                <div className="h-3 bg-surface-container-high rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <div className="h-5 bg-surface-container-high rounded w-40" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-container-high rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
