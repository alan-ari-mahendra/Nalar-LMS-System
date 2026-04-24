import { getPublishedCourses, getCategories } from "@/lib/queries"
import CourseCatalogPage from "./catalog-client"

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
  ])

  return <CourseCatalogPage courses={courses} categories={categories} />
}
