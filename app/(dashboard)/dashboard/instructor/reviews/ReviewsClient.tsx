"use client"

import { useMemo, useState } from "react"
import { Avatar } from "@/components/shared/Avatar"
import { RatingStars } from "@/components/shared/RatingStars"
import type { InstructorReview } from "@/lib/actions/review"

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1"
type Sort = "newest" | "highest" | "lowest"

interface ReviewsClientProps {
  reviews: InstructorReview[]
}

export function ReviewsClient({ reviews }: ReviewsClientProps) {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [sort, setSort] = useState<Sort>("newest")

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>()
    reviews.forEach((r) => map.set(r.course.id, r.course.title))
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }))
  }, [reviews])

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  }, [reviews])

  const filtered = useMemo(() => {
    let items = reviews
    if (ratingFilter !== "all") {
      const target = Number(ratingFilter)
      items = items.filter((r) => r.rating === target)
    }
    if (courseFilter !== "all") {
      items = items.filter((r) => r.course.id === courseFilter)
    }
    if (sort === "newest") {
      items = [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } else if (sort === "highest") {
      items = [...items].sort((a, b) => b.rating - a.rating)
    } else {
      items = [...items].sort((a, b) => a.rating - b.rating)
    }
    return items
  }, [reviews, ratingFilter, courseFilter, sort])

  const ratingCounts = useMemo(() => {
    const counts: Record<RatingFilter, number> = {
      all: reviews.length,
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0,
    }
    reviews.forEach((r) => {
      const k = String(r.rating) as RatingFilter
      if (k in counts) counts[k]++
    })
    return counts
  }, [reviews])

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Reviews</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Feedback from students who took your courses.
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3 bg-surface-container border border-outline-variant rounded-xl px-4 py-2.5">
            <RatingStars rating={avgRating} size="md" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-on-surface">{avgRating.toFixed(1)}</p>
              <p className="text-xs text-on-surface-variant">{reviews.length} reviews</p>
            </div>
          </div>
        )}
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "5", "4", "3", "2", "1"] as RatingFilter[]).map((r) => {
            const active = ratingFilter === r
            return (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {r === "all" ? (
                  "All"
                ) : (
                  <>
                    {r}
                    <span className="material-symbols-outlined !text-sm">star</span>
                  </>
                )}
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded ${
                    active ? "bg-on-primary/20 text-on-primary" : "bg-surface-container-high"
                  }`}
                >
                  {ratingCounts[r]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary flex-1"
          >
            <option value="all">All Courses</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary sm:w-48"
          >
            <option value="newest">Newest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">rate_review</span>
          <p className="text-sm">
            {reviews.length === 0
              ? "No reviews yet. They'll show up once students complete your courses."
              : "No reviews match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: InstructorReview }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <article className="bg-surface-container border border-outline-variant rounded-xl p-5 flex flex-col gap-3">
      <header className="flex items-start gap-3">
        <Avatar src={review.student.avatarUrl} name={review.student.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface">{review.student.name}</p>
          <p className="text-xs text-on-surface-variant">{date}</p>
          <p className="text-xs text-on-surface-variant mt-0.5 truncate">{review.course.title}</p>
        </div>
      </header>

      <RatingStars rating={review.rating} size="sm" />

      {review.comment && (
        <p className="text-sm text-on-surface leading-relaxed italic">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}

      <button
        type="button"
        disabled
        title="Reply feature coming soon"
        className="self-start mt-2 px-3 py-1.5 border border-outline-variant bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-lg cursor-not-allowed opacity-60 flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined !text-sm">reply</span>
        Reply
      </button>
    </article>
  )
}
