"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { enrollInFreeCourse } from "@/lib/actions/enrollment"
import { submitReview } from "@/lib/actions/review"
import { Avatar } from "@/components/shared/Avatar"
import { RatingStars } from "@/components/shared/RatingStars"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { formatPrice, formatDuration, formatRelativeTime } from "@/lib/utils"
import type { CourseDetail } from "@/type"

type Tab = "overview" | "curriculum" | "instructor" | "reviews"

interface CourseDetailPageProps {
  course: CourseDetail
  enrolled: boolean
  pendingOrderId: string | null
}

export default function CourseDetailPage({ course, enrolled, pendingOrderId }: CourseDetailPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [expandedChapters, setExpandedChapters] = useState<string[]>([course.chapters[0]?.id])
  const router = useRouter()
  const [isEnrolling, startEnroll] = useTransition()
  const [enrollError, setEnrollError] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, startReviewSubmit] = useTransition()
  const [reviewSuccess, setReviewSuccess] = useState("")
  const [reviewError, setReviewError] = useState("")

  const firstLessonId = course.chapters[0]?.lessons[0]?.id ?? ""

  function handleFreeEnroll() {
    setEnrollError("")
    startEnroll(async () => {
      const result = await enrollInFreeCourse({ courseId: course.id })
      if (result.success) {
        router.push(`/learn/${course.id}/${firstLessonId}`)
      } else {
        setEnrollError(result.error)
      }
    })
  }

  function handlePaidCheckout() {
    setEnrollError("")
    router.push(`/checkout/course/${course.id}`)
  }

  function handleSubmitReview() {
    setReviewError("")
    setReviewSuccess("")
    startReviewSubmit(async () => {
      const result = await submitReview({
        courseId: course.id,
        rating: reviewRating,
        comment: reviewComment,
      })
      if (result.success) {
        setReviewSuccess("Review submitted successfully!")
        setReviewComment("")
        router.refresh()
      } else {
        setReviewError(result.error)
      }
    })
  }

  function toggleChapter(id: string) {
    setExpandedChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "curriculum", label: "Curriculum" },
    { key: "instructor", label: "Instructor" },
    { key: "reviews", label: "Reviews" },
  ]

  // Rating distribution (simulated from review data)
  const ratingBars = [
    { stars: 5, pct: 85 },
    { stars: 4, pct: 10 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ]

  return (
    <>
      <main className="pt-8 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ============================================================
              LEFT COLUMN
              ============================================================ */}
          <div className="lg:w-[65%] space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="material-symbols-outlined !text-xs">chevron_right</span>
              <Link href="/courses" className="hover:text-primary">{course.category.name}</Link>
              <span className="material-symbols-outlined !text-xs">chevron_right</span>
              <span className="text-on-surface truncate">{course.title}</span>
            </nav>

            {/* Header */}
            <div className="space-y-4">
              <CourseBadge label={course.category.name} variant="category" />
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {course.shortDesc}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 text-sm py-4 border-y border-outline-variant">
              <div className="flex items-center gap-1">
                <span className="text-tertiary font-bold">{course.rating}</span>
                <RatingStars rating={course.rating} size="sm" />
                <span className="text-on-surface-variant">({course.reviewCount.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined !text-base">group</span>
                {course.enrollmentCount.toLocaleString()} students
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined !text-base">update</span>
                Last updated {course.publishedAt ? new Date(course.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
              </div>
            </div>

            {/* Instructor short */}
            <div className="flex items-center gap-4">
              <Avatar src={course.instructor.avatarUrl} name={course.instructor.fullName} size="md" />
              <div>
                <p className="text-sm text-on-surface-variant">Created by</p>
                <p className="font-semibold text-primary">{course.instructor.fullName}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <span className="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-lg border border-outline-variant text-xs font-medium">
                  <span className="material-symbols-outlined !text-xs">language</span> {course.language === "id" ? "Indonesian" : "English"}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 bg-surface-container rounded-lg border border-outline-variant text-xs font-medium">
                  <span className="material-symbols-outlined !text-xs">bar_chart</span> {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                </span>
              </div>
            </div>

            {/* ============================================================
                TABS
                ============================================================ */}
            <div className="pt-4">
              <div className="flex border-b border-outline-variant gap-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? "text-primary border-b-2 border-primary"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="py-8 space-y-12">
                {/* ---- OVERVIEW ---- */}
                {activeTab === "overview" && (
                  <>
                    {/* What you'll learn */}
                    <div className="bg-surface-container p-6 rounded-xl border border-outline-variant">
                      <h3 className="text-xl font-bold mb-6">What you&apos;ll learn</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {course.outcomes.map((outcome, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="material-symbols-outlined text-tertiary shrink-0">check_circle</span>
                            <span className="text-on-surface-variant">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Requirements</h3>
                      <ul className="list-disc list-inside space-y-2 text-on-surface-variant marker:text-primary">
                        {course.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Course Description</h3>
                      <div className="text-on-surface-variant leading-relaxed space-y-4">
                        <p>{course.description}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* ---- CURRICULUM ---- */}
                {activeTab === "curriculum" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Curriculum</h3>
                    <p className="text-sm text-on-surface-variant">
                      {course.chapters.length} chapters &bull; {course.totalLessons} lessons &bull; {formatDuration(course.totalDuration)} total
                    </p>
                    <div className="border border-outline-variant rounded-xl overflow-hidden">
                      {course.chapters.map((chapter) => {
                        const isOpen = expandedChapters.includes(chapter.id)
                        const chapterDuration = chapter.lessons.reduce((sum, l) => sum + (l.duration || 0), 0)

                        return (
                          <div key={chapter.id}>
                            {/* Chapter header */}
                            <button
                              onClick={() => toggleChapter(chapter.id)}
                              className="w-full bg-surface-container-high border-b border-outline-variant p-4 flex justify-between items-center hover:bg-surface-container-highest transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">
                                  {isOpen ? "expand_more" : "chevron_right"}
                                </span>
                                <span className="font-bold text-left">{chapter.title}</span>
                              </div>
                              <span className="text-sm text-on-surface-variant shrink-0">
                                {chapter.lessons.length} lessons &bull; {formatDuration(chapterDuration)}
                              </span>
                            </button>

                            {/* Lessons */}
                            {isOpen && (
                              <div>
                                {chapter.lessons.map((lesson, li) => (
                                  <div
                                    key={lesson.id}
                                    className={`flex items-center p-4 hover:bg-surface-container transition-colors ${
                                      li > 0 ? "border-t border-outline-variant/50" : ""
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-on-surface-variant mr-4">
                                      {lesson.type === "VIDEO" ? "play_circle" : lesson.type === "QUIZ" ? "quiz" : lesson.type === "ATTACHMENT" ? "description" : "article"}
                                    </span>
                                    <span className="text-on-surface-variant flex-1">{lesson.title}</span>
                                    {lesson.isFree && (
                                      <span className="text-xs text-primary font-bold mr-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined !text-sm">visibility</span> Preview
                                      </span>
                                    )}
                                    {lesson.duration && (
                                      <span className="text-sm text-on-surface-variant">{formatDuration(lesson.duration)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ---- INSTRUCTOR ---- */}
                {activeTab === "instructor" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Your Instructor</h3>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <Avatar src={course.instructor.avatarUrl} name={course.instructor.fullName} size="lg" />
                      <div className="space-y-4 flex-1">
                        <div>
                          <h4 className="text-2xl font-bold text-primary">{course.instructor.fullName}</h4>
                          <p className="text-on-surface-variant">{course.instructor.headline}</p>
                        </div>
                        <div className="flex gap-6">
                          <div>
                            <p className="font-bold text-lg">{course.instructor.courseCount}</p>
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider">Courses</p>
                          </div>
                          <div>
                            <p className="font-bold text-lg">{course.instructor.studentCount.toLocaleString()}</p>
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider">Students</p>
                          </div>
                          <div>
                            <p className="font-bold text-lg">{course.instructor.rating}</p>
                            <p className="text-xs text-on-surface-variant uppercase tracking-wider">Rating</p>
                          </div>
                        </div>
                        <p className="text-on-surface-variant leading-relaxed">
                          {course.instructor.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- REVIEWS ---- */}
                {activeTab === "reviews" && (
                  <div className="space-y-8">
                    {/* Write a Review */}
                    <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-bold">Write a Review</h3>
                      {reviewSuccess && (
                        <p className="text-tertiary text-sm">{reviewSuccess}</p>
                      )}
                      {reviewError && (
                        <p className="text-error text-sm">{reviewError}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-on-surface-variant">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="transition-colors"
                            >
                              <span className={`material-symbols-outlined !text-2xl ${star <= reviewRating ? "text-primary" : "text-outline"}`}>
                                star
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this course (min 10 characters)..."
                        rows={3}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background resize-none"
                      />
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || reviewComment.length < 10}
                        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>

                    <h3 className="text-xl font-bold">Student Feedback</h3>

                    {/* Rating overview */}
                    <div className="grid md:grid-cols-4 gap-8 items-center bg-surface-container-low p-6 rounded-xl border border-outline-variant">
                      <div className="text-center">
                        <p className="text-5xl font-extrabold text-primary">{course.rating}</p>
                        <div className="flex justify-center my-2">
                          <RatingStars rating={course.rating} size="md" />
                        </div>
                        <p className="text-xs font-bold uppercase text-on-surface-variant">Course Rating</p>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        {ratingBars.map((bar) => (
                          <div key={bar.stars} className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: `${bar.pct}%` }} />
                            </div>
                            <div className="flex gap-0.5 w-20">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`material-symbols-outlined !text-xs ${i < bar.stars ? "text-primary" : "text-outline"}`}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-on-surface-variant w-8">{bar.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review cards */}
                    <div className="grid gap-6">
                      {course.reviews.map((review) => (
                        <div key={review.id} className="p-6 bg-surface-container border border-outline-variant rounded-xl">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar src={review.student.avatarUrl} name={review.student.fullName} size="sm" />
                            <div>
                              <h5 className="font-bold">{review.student.fullName}</h5>
                              <RatingStars rating={review.rating} size="sm" />
                            </div>
                            <span className="ml-auto text-xs text-on-surface-variant">
                              {formatRelativeTime(review.createdAt)}
                            </span>
                          </div>
                          <p className="text-on-surface-variant leading-relaxed italic">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN — Sticky Enrollment Card
              ============================================================ */}
          <div className="hidden lg:block lg:w-[35%]">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-surface-container rounded-xl border border-outline-variant shadow-2xl overflow-hidden group">
                {/* Thumbnail + play */}
                <div className="relative aspect-video">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-background/40 flex items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined !text-4xl">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded text-xs font-bold text-on-surface uppercase">
                    Preview this course
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-extrabold text-on-surface">
                        {formatPrice(course.price)}
                      </span>
                      {!course.isFree && (
                        <span className="text-lg text-on-surface-variant line-through mb-1">
                          {formatPrice(course.price * 2)}
                        </span>
                      )}
                    </div>
                    {!course.isFree && (
                      <p className="text-tertiary text-sm font-semibold">50% Off for early bird enrollment</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="space-y-3">
                    {enrolled ? (
                      <Link
                        href={`/learn/${course.id}/${firstLessonId}`}
                        className="block w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all active:scale-[0.98] text-center"
                      >
                        Continue Learning
                      </Link>
                    ) : pendingOrderId ? (
                      <Link
                        href={`/checkout/order/${pendingOrderId}/pay`}
                        className="block w-full py-4 bg-amber-500 text-background font-bold rounded-lg hover:brightness-110 transition-all active:scale-[0.98] text-center"
                      >
                        Resume Checkout
                      </Link>
                    ) : course.isFree ? (
                      <button
                        onClick={handleFreeEnroll}
                        disabled={isEnrolling}
                        className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEnrolling ? "Enrolling..." : "Enroll for Free"}
                      </button>
                    ) : (
                      <button
                        onClick={handlePaidCheckout}
                        className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all active:scale-[0.98]"
                      >
                        Enroll Now
                      </button>
                    )}
                    {enrollError && (
                      <p className="text-error text-xs text-center mt-2">{enrollError}</p>
                    )}
                    <p className="text-center text-xs text-on-surface-variant">30-day money back guarantee</p>
                  </div>

                  {/* Includes */}
                  <div className="space-y-4">
                    <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">This course includes:</p>
                    <ul className="space-y-3 text-sm">
                      {[
                        { icon: "play_circle", text: `${formatDuration(course.totalDuration)} of on-demand video` },
                        { icon: "menu_book", text: `${course.totalLessons} lessons across ${course.chapters.length} modules` },
                        { icon: "download", text: `${course.attachments.length} downloadable resources` },
                        { icon: "all_inclusive", text: "Full lifetime access" },
                        { icon: "workspace_premium", text: "Certificate of completion" },
                      ].map((item) => (
                        <li key={item.icon} className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary !text-xl">{item.icon}</span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Share / Gift */}
                  <div className="flex gap-4 pt-4 border-t border-outline-variant">
                    <button className="flex-1 text-sm font-bold hover:text-primary transition-colors">Share</button>
                    <button className="flex-1 text-sm font-bold hover:text-primary transition-colors">Gift this course</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          MOBILE STICKY CTA
          ============================================================ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 z-50 flex items-center justify-between">
        <div>
          {!course.isFree && (
            <p className="text-sm text-on-surface-variant line-through">{formatPrice(course.price * 2)}</p>
          )}
          <p className="text-xl font-bold">{formatPrice(course.price)}</p>
        </div>
        {enrolled ? (
          <Link
            href={`/learn/${course.id}/${firstLessonId}`}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold"
          >
            Continue
          </Link>
        ) : pendingOrderId ? (
          <Link
            href={`/checkout/order/${pendingOrderId}/pay`}
            className="bg-amber-500 text-background px-8 py-3 rounded-lg font-bold"
          >
            Resume
          </Link>
        ) : course.isFree ? (
          <button
            onClick={handleFreeEnroll}
            disabled={isEnrolling}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnrolling ? "Enrolling..." : "Enroll Free"}
          </button>
        ) : (
          <button
            onClick={handlePaidCheckout}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold"
          >
            Enroll Now
          </button>
        )}
      </div>
    </>
  )
}
