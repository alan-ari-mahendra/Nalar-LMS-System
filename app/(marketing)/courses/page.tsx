import { getPublishedCourses, getCategories, getWishlistedCourseIds } from "@/lib/queries"
import { getCurrentUser } from "@/lib/auth/actions"
import CourseCatalogPage from "./catalog-client"

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
