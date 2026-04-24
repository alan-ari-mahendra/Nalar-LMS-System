export default function PlayerLoading() {
  return (
    <div className="flex h-screen bg-background animate-pulse">
      {/* Video area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-14 bg-surface-container border-b border-outline-variant flex items-center px-4 gap-3">
          <div className="h-5 bg-surface-container-high rounded w-32" />
          <div className="h-2 bg-surface-container-high rounded flex-1 max-w-xs" />
        </div>
        {/* Video placeholder */}
        <div className="flex-1 bg-surface-container-high" />
        {/* Bottom tabs */}
        <div className="h-64 bg-surface-container border-t border-outline-variant p-6 space-y-4">
          <div className="flex gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-5 bg-surface-container-high rounded w-20" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-surface-container-high rounded w-3/4" />
            <div className="h-4 bg-surface-container-high rounded w-1/2" />
            <div className="h-4 bg-surface-container-high rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-[360px] bg-surface-container border-l border-outline-variant p-4 space-y-4">
        <div className="h-6 bg-surface-container-high rounded w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 bg-surface-container-high rounded w-40" />
            <div className="space-y-1 pl-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 bg-surface-container-high rounded w-48" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
