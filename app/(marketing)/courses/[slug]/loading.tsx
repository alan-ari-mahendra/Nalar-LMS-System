export default function CourseDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 bg-surface-container-high rounded w-48 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-8 bg-surface-container-high rounded w-3/4" />
          <div className="h-5 bg-surface-container-high rounded w-full" />
          <div className="h-5 bg-surface-container-high rounded w-2/3" />
          <div className="flex gap-4">
            <div className="h-6 bg-surface-container-high rounded w-20" />
            <div className="h-6 bg-surface-container-high rounded w-24" />
            <div className="h-6 bg-surface-container-high rounded w-16" />
          </div>
          {/* Tabs */}
          <div className="flex gap-6 border-b border-outline-variant pt-4 pb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 bg-surface-container-high rounded w-20" />
            ))}
          </div>
          {/* Content area */}
          <div className="space-y-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-surface-container-high rounded" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
            <div className="aspect-video bg-surface-container-high rounded-lg" />
            <div className="h-8 bg-surface-container-high rounded w-24" />
            <div className="h-12 bg-surface-container-high rounded-lg" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-container-high rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
