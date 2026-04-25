export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-32" />
        <div className="h-4 bg-surface-container-high rounded w-64" />
      </header>

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-surface-container-high rounded-lg w-20" />
        ))}
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="h-12 bg-surface-container-high/50" />
        <div className="divide-y divide-outline-variant">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6">
              <div className="h-4 bg-surface-container-high rounded flex-1 max-w-md" />
              <div className="h-4 bg-surface-container-high rounded w-24" />
              <div className="h-4 bg-surface-container-high rounded w-32" />
              <div className="h-6 bg-surface-container-high rounded w-20" />
              <div className="h-4 bg-surface-container-high rounded w-24" />
              <div className="h-4 bg-surface-container-high rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
