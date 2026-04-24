import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton"

export default function CoursesLoading() {
  return (
    <main className="max-w-screen-2xl mx-auto px-6 py-12">
      {/* Header skeleton */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-surface-container-high rounded w-72" />
          <div className="h-4 bg-surface-container-high rounded w-48" />
        </div>
        <div className="w-full md:w-[400px] h-12 bg-surface-container-high rounded-lg animate-pulse" />
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden md:block w-[260px] shrink-0 space-y-6 animate-pulse">
          <div className="h-6 bg-surface-container-high rounded w-20" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 bg-surface-container-high rounded w-40" />
            ))}
          </div>
          <div className="h-6 bg-surface-container-high rounded w-16" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 bg-surface-container-high rounded w-32" />
            ))}
          </div>
        </aside>

        {/* Grid skeleton */}
        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
