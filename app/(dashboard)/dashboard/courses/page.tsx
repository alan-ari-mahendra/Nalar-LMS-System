import { requireAuth } from "@/lib/auth/guards"
import { getMyEnrollments } from "@/lib/actions/enrollment"
import { MyCoursesClient } from "./MyCoursesClient"

export default async function MyCoursesPage() {
  await requireAuth()
  const enrollments = await getMyEnrollments()

  return <MyCoursesClient enrollments={enrollments} />
}
