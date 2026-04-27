import Link from "next/link"
import { requireAuth } from "@/lib/auth/guards"
import { getWishlistByUser } from "@/lib/queries"
import { CourseCard } from "@/components/course/CourseCard"

export default async function WishlistPage() {
  const user = await requireAuth()
  const courses = await getWishlistByUser(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Wishlist</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Courses you saved for later — {courses.length} {courses.length === 1 ? "item" : "items"}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl py-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant !text-5xl opacity-40">
            favorite_border
          </span>
          <p className="mt-3 text-sm text-on-surface-variant">
            Your wishlist is empty. Browse the catalog to save courses for later.
          </p>
          <Link
            href="/courses"
            className="inline-block mt-4 bg-primary text-on-primary px-5 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} wishlistable wishlisted />
          ))}
        </div>
      )}
    </div>
  )
}
