export default function SettingsLoading() {
  return (
    <div className="space-y-10 max-w-3xl animate-pulse">
      <header className="space-y-2">
        <div className="h-8 bg-surface-container-high rounded w-32" />
        <div className="h-4 bg-surface-container-high rounded w-64" />
      </header>

      {Array.from({ length: 2 }).map((_, s) => (
        <section
          key={s}
          className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-6"
        >
          <div className="space-y-2">
            <div className="h-6 bg-surface-container-high rounded w-24" />
            <div className="h-4 bg-surface-container-high rounded w-72" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-surface-container-high rounded w-32" />
              <div className="h-10 bg-surface-container-high rounded-lg" />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
