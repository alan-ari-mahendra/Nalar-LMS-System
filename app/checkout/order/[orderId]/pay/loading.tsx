export default function PayLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <header className="border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="h-6 bg-surface-container-high rounded w-40" />
          <div className="h-4 bg-surface-container-high rounded w-24" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-6">
          <div className="h-12 bg-surface-container-high rounded" />
          <div className="h-32 bg-surface-container-high rounded-lg" />
          <div className="h-20 bg-surface-container-high rounded-lg" />
          <div className="flex gap-3">
            <div className="w-28 h-12 bg-surface-container-high rounded-lg" />
            <div className="flex-1 h-12 bg-surface-container-high rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  )
}
