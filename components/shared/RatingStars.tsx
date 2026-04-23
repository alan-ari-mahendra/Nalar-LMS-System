interface RatingStarsProps {
  rating: number
  count?: number
  size?: "sm" | "md"
}

export function RatingStars({ rating, count, size = "md" }: RatingStarsProps) {
  const iconSize = size === "sm" ? "!text-sm" : "!text-base"
  const countSize = size === "sm" ? "text-xs" : "text-sm"

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined ${iconSize} ${
              star <= Math.round(rating) ? "text-primary" : "text-outline"
            }`}
          >
            star
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className={`${countSize} text-on-surface-variant`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}

export default RatingStars
