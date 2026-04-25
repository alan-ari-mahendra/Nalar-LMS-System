export default function MyCoursesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <header className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-48" />
        <div className="h-4 bg-surface-container-high rounded w-64" />
      </header>

      <div className="flex gap-3 border-b border-outline-variant">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-surface-container-high rounded w-24 my-2" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden"
          >
            <div className="aspect-video bg-surface-container-high" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-surface-container-high rounded w-3/4" />
              <div className="h-3 bg-surface-container-high rounded w-1/2" />
              <div className="h-2 bg-surface-container-high rounded w-full" />
              <div className="h-9 bg-surface-container-high rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
