import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"

export default async function AdminPage() {
  await requireRole(["ADMIN"])
  redirect("/dashboard/admin/users")
}
