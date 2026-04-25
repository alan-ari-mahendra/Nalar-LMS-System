export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-40" />
        <div className="h-4 bg-surface-container-high rounded w-64" />
      </header>
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-surface-container-high rounded-lg" />
        <div className="w-80 h-10 bg-surface-container-high rounded-lg" />
      </div>
      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="h-12 bg-surface-container-high/50" />
        <div className="divide-y divide-outline-variant">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6">
              <div className="w-8 h-8 rounded-full bg-surface-container-high" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-surface-container-high rounded w-32" />
                <div className="h-3 bg-surface-container-high rounded w-48" />
              </div>
              <div className="h-4 bg-surface-container-high rounded w-32" />
              <div className="h-4 bg-surface-container-high rounded w-20" />
              <div className="h-6 bg-surface-container-high rounded w-20" />
              <div className="h-4 bg-surface-container-high rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
