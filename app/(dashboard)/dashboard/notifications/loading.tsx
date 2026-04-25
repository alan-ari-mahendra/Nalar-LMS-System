export default function NotificationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-56" />
      </header>

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-high shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-container-high rounded w-3/4" />
              <div className="h-3 bg-surface-container-high rounded w-1/2" />
              <div className="h-3 bg-surface-container-high rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
