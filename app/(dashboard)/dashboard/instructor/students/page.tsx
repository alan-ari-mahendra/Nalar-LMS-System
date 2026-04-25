import { requireRole } from "@/lib/auth/guards"
import { getInstructorStudents } from "@/lib/actions/instructor"
import { StudentsClient } from "./StudentsClient"

export default async function InstructorStudentsPage() {
  await requireRole(["TEACHER", "ADMIN"])
  const students = await getInstructorStudents()

  return <StudentsClient enrollments={students} />
}
