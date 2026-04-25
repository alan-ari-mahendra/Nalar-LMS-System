"use client"

import { useState, useMemo } from "react"
import { CourseCard } from "@/components/course/CourseCard"
import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton"
import type { Course, Category, CourseLevel } from "@/type"

const ITEMS_PER_PAGE = 6

type SortOption = "newest" | "popular" | "rating" | "price-asc"

interface CourseCatalogPageProps {
  courses: Course[]
  categories: Category[]
}

export default function CourseCatalogPage({ courses: allCourses, categories }: CourseCatalogPageProps) {
  // Filter state
  const [search, setSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "ALL">("ALL")
  const [ratingFilter, setRatingFilter] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...allCourses]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructor.fullName.toLowerCase().includes(q)
      )
    }

    // Category
    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.categoryId))
    }

    // Level
    if (selectedLevel !== "ALL") {
      result = result.filter((c) => c.level === selectedLevel)
    }

    // Rating 4+
    if (ratingFilter) {
      result = result.filter((c) => c.rating >= 4.0)
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "popular":
        result.sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
    }

    return result
  }, [search, selectedCategories, selectedLevel, ratingFilter, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  function toggleCategory(catId: string) {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    )
    setCurrentPage(1)
  }

  function clearFilters() {
    setSearch("")
    setSelectedCategories([])
    setSelectedLevel("ALL")
    setRatingFilter(false)
    setCurrentPage(1)
  }

  // Sidebar content (shared between mobile drawer and desktop)
  const filterSidebar = (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-on-surface">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-primary uppercase tracking-wider hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Category filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
          Category
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Level filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
          Level
        </h3>
        <div className="space-y-2">
          {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((level) => (
            <label key={level} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="level"
                checked={selectedLevel === level}
                onChange={() => { setSelectedLevel(level); setCurrentPage(1) }}
                className="bg-surface-container-highest border-outline-variant text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm text-on-surface">
                {level === "ALL" ? "All Levels" : level.charAt(0) + level.slice(1).toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
          Rating
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={ratingFilter}
            onChange={() => { setRatingFilter(!ratingFilter); setCurrentPage(1) }}
            className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary focus:ring-offset-0"
          />
          <div className="flex items-center text-sm text-on-surface group-hover:text-primary transition-colors">
            4.0
            <span className="material-symbols-outlined !text-[16px] ml-1 text-primary">star</span>
            &nbsp;&amp; up
          </div>
        </label>
      </div>
    </div>
  )

  return (
    <main className="max-w-screen-2xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
            Explore Courses
          </h1>
          <p className="text-on-surface-variant">
            Showing {filtered.length} courses across all categories
          </p>
        </div>
        <div className="w-full md:w-[400px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline"
            placeholder="Search courses, skills, or authors..."
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="md:hidden flex items-center gap-2 bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm font-medium text-on-surface"
        >
          <span className="material-symbols-outlined !text-lg">tune</span>
          Filters
          {(selectedCategories.length > 0 || selectedLevel !== "ALL" || ratingFilter) && (
            <span className="ml-auto bg-primary text-on-primary text-xs px-1.5 py-0.5 rounded-full font-bold">
              {selectedCategories.length + (selectedLevel !== "ALL" ? 1 : 0) + (ratingFilter ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="md:hidden bg-surface-container border border-outline-variant rounded-xl p-6">
            {filterSidebar}
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-[260px] shrink-0">
          <div className="sticky top-24">
            {filterSidebar}
          </div>
        </aside>

        {/* Main grid area */}
        <section className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg border border-outline-variant hover:border-primary transition-colors text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="popular">Sort by: Most Popular</option>
              <option value="rating">Sort by: Highest Rated</option>
              <option value="price-asc">Sort by: Price Low-High</option>
            </select>
            <span className="text-sm text-on-surface-variant">
              {filtered.length} course{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Course grid */}
          {paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginated.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">search_off</span>
              <p className="text-sm">No courses found matching your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-primary text-sm font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Loading skeleton (hidden, available for future async) */}
          <div className="hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:border-primary transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                    currentPage === i + 1
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant text-on-surface hover:border-primary"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:border-primary transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
