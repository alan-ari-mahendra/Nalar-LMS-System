import Image from "next/image"
import Link from "next/link"
import type { Course } from "@/type"
import { RatingStars } from "@/components/shared/RatingStars"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { ProgressBar } from "@/components/shared/ProgressBar"
import { WishlistButton } from "@/components/course/WishlistButton"
import { formatPrice, formatDuration } from "@/lib/utils"

interface CourseCardProps {
  course: Course
  compact?: boolean
  showProgress?: boolean
  progress?: number
  wishlistable?: boolean
  wishlisted?: boolean
}

export function CourseCard({
  course,
  compact = false,
  showProgress = false,
  progress = 0,
  wishlistable = false,
  wishlisted = false,
}: CourseCardProps) {
  if (compact) {
    return (
      <Link
        href={`/courses/${course.slug}`}
        className="group flex gap-4 bg-surface-container border border-outline-variant rounded-xl p-3 hover:border-primary/50 transition-all"
      >
        <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {course.instructor.fullName}
          </p>
          {showProgress && (
            <div className="mt-2">
              <ProgressBar value={progress} size="sm" showLabel />
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group bg-surface-container border border-outline-variant rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3">
          <CourseBadge label={course.category.name} variant="category" />
        </div>
        {wishlistable && (
          <WishlistButton courseId={course.id} initialActive={wishlisted} />
        )}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
            <ProgressBar value={progress} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-xs text-on-surface-variant mt-1">
          {course.instructor.fullName}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <RatingStars rating={course.rating} size="sm" />
          <span className="text-xs text-on-surface-variant">
            {course.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-sm font-bold text-on-surface">
            {formatPrice(course.price)}
          </span>
          {course.isFree && (
            <CourseBadge label="Free" variant="free" />
          )}
          <span className="text-xs text-on-surface-variant">
            {formatDuration(course.totalDuration)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
