export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-48 bg-surface-container-high rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-surface-container border border-outline-variant rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-surface-container border border-outline-variant rounded-xl" />
    </div>
  )
}
