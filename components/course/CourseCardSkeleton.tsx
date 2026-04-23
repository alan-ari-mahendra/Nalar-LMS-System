export function CourseCardSkeleton() {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden animate-pulse">
      {/* Thumbnail */}
      <div className="aspect-video bg-surface-container-high" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-container-high rounded w-3/4" />
        <div className="h-3 bg-surface-container-high rounded w-1/2" />
        <div className="h-3 bg-surface-container-high rounded w-1/3" />
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-surface-container-high rounded w-20" />
          <div className="h-3 bg-surface-container-high rounded w-12" />
        </div>
      </div>
    </div>
  )
}

export default CourseCardSkeleton
