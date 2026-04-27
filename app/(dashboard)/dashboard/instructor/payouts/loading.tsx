export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-40 bg-surface-container-high rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-28 bg-surface-container border border-outline-variant rounded-xl" />
        <div className="h-28 bg-surface-container border border-outline-variant rounded-xl" />
      </div>
      <div className="h-64 bg-surface-container border border-outline-variant rounded-xl" />
    </div>
  )
}
