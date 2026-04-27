"use client"

import { useEffect, useMemo, useState } from "react"
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
  const [replyTarget, setReplyTarget] = useState<InstructorReview | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  function handleReplySent() {
    // TODO: connect to DB when reply feature is ready
    setReplyTarget(null)
    setToast("Reply sent")
  }

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
            <ReviewCard key={r.id} review={r} onReply={() => setReplyTarget(r)} />
          ))}
        </div>
      )}

      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          onCancel={() => setReplyTarget(null)}
          onSent={handleReplySent}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 bg-tertiary-container text-tertiary border border-tertiary/30 rounded-lg px-4 py-3 shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2"
        >
          <span className="material-symbols-outlined !text-base">check_circle</span>
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </div>
  )
}

function ReviewCard({
  review,
  onReply,
}: {
  review: InstructorReview
  onReply: () => void
}) {
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
        onClick={onReply}
        className="self-start mt-2 px-3 py-1.5 border border-outline-variant bg-surface-container-low text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container hover:border-primary/50 transition-colors flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined !text-sm">reply</span>
        Reply
      </button>
    </article>
  )
}

function ReplyModal({
  review,
  onCancel,
  onSent,
}: {
  review: InstructorReview
  onCancel: () => void
  onSent: () => void
}) {
  const [body, setBody] = useState("")

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onCancel])

  function handleSend() {
    if (!body.trim()) return
    // TODO: connect to DB when reply feature is ready
    onSent()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reply-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-surface-container border border-outline-variant rounded-xl shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 id="reply-modal-title" className="text-lg font-bold text-on-surface">
            Reply to {review.student.name}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined !text-xl">close</span>
          </button>
        </div>

        <blockquote className="bg-surface-container-low border-l-2 border-outline-variant px-3 py-2 text-xs text-on-surface-variant italic line-clamp-3">
          &ldquo;{review.comment ?? "(No comment)"}&rdquo;
        </blockquote>

        <div className="space-y-2">
          <label htmlFor="reply-body" className="text-sm font-medium text-on-surface">
            Your reply
          </label>
          <textarea
            id="reply-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            autoFocus
            placeholder="Thanks for the feedback..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="border border-outline-variant bg-surface-container-low text-on-surface px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!body.trim()}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Reply
          </button>
        </div>
      </div>
    </div>
  )
}
