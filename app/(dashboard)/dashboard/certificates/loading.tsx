export default function CertificatesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <header className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-56" />
        <div className="h-4 bg-surface-container-high rounded w-72" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden"
          >
            <div className="h-2 bg-surface-container-high" />
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-high rounded w-3/4" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-surface-container-high rounded-lg" />
                <div className="flex-1 h-9 bg-surface-container-high rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
