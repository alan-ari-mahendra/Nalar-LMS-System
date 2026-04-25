import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/lib/queries"
import CourseDetailPage from "./detail-client"

export default async function CourseSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()

  return <CourseDetailPage course={course} />
}
