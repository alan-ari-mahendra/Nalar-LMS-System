import { redirect } from "next/navigation"
import type { Role } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth/actions"
import { RegisterForm } from "./RegisterForm"

const roleHome: Record<Role, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/instructor",
  STUDENT: "/dashboard",
}

export default async function RegisterPage() {
  const user = await getCurrentUser()
  if (user) redirect(roleHome[user.role])
  return <RegisterForm />
}
