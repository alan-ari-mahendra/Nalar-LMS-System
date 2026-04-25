import { requireRole } from "@/lib/auth/guards"
import { getAllCoursesAdmin } from "@/lib/queries"
import { AdminCoursesTable } from "./courses-client"

export default async function AdminCoursesPage() {
  await requireRole(["ADMIN"])
  const courses = await getAllCoursesAdmin()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight">Course Management</h2>
      <AdminCoursesTable courses={courses.map((c) => ({
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        status: c.status,
        level: c.level,
        price: Number(c.price),
        enrollmentCount: c.enrollmentCount,
        createdAt: c.createdAt.toISOString(),
        instructorName: c.instructor.name ?? "Unknown",
      }))} />
    </div>
  )
}
