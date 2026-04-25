import { requireRole } from "@/lib/auth/guards"
import { getCategories } from "@/lib/queries"
import { CreateCourseForm } from "./create-form"

export default async function NewCoursePage() {
  await requireRole(["TEACHER", "ADMIN"])
  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight">Create New Course</h2>
      <CreateCourseForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  )
}
