export default function CheckoutCourseLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <header className="border-b border-outline-variant">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="h-6 bg-surface-container-high rounded w-28" />
          <div className="h-4 bg-surface-container-high rounded w-32" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="h-8 bg-surface-container-high rounded w-40 mb-2" />
        <div className="h-4 bg-surface-container-high rounded w-72 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
            <div className="h-6 bg-surface-container-high rounded w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-container-high rounded-lg" />
            ))}
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden h-fit">
            <div className="aspect-video bg-surface-container-high" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-surface-container-high rounded w-3/4" />
              <div className="h-3 bg-surface-container-high rounded w-1/2" />
              <div className="h-20 bg-surface-container-high rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
