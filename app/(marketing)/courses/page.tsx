import type { Metadata } from "next"
import { getPublishedCourses, getCategories, getWishlistedCourseIds } from "@/lib/queries"
import { getCurrentUser } from "@/lib/auth/actions"
import CourseCatalogPage from "./catalog-client"

export const metadata: Metadata = {
  title: "Browse Courses",
  description: "Explore courses across web development, design, data, and more.",
}

export default async function CoursesPage() {
  const user = await getCurrentUser()
  const [courses, categories, wishlistedSet] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
    user ? getWishlistedCourseIds(user.id) : Promise.resolve(new Set<string>()),
  ])

  return (
    <CourseCatalogPage
      courses={courses}
      categories={categories}
      wishlistedIds={Array.from(wishlistedSet)}
      isAuthenticated={Boolean(user)}
    />
  )
}
