import { requireRole } from "@/lib/auth/guards"
import { getInstructorReviews } from "@/lib/actions/review"
import { ReviewsClient } from "./ReviewsClient"

export default async function InstructorReviewsPage() {
  await requireRole(["TEACHER", "ADMIN"])
  const reviews = await getInstructorReviews()

  return <ReviewsClient reviews={reviews} />
}
