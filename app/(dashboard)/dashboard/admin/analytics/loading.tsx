export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-56 bg-surface-container-high rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface-container border border-outline-variant rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 bg-surface-container border border-outline-variant rounded-xl" />
        ))}
      </div>
    </div>
  )
}
