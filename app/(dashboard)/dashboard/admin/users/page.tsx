import { requireRole } from "@/lib/auth/guards"
import { getAllUsers } from "@/lib/queries"
import { UsersTable } from "./users-client"

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"])
  const users = await getAllUsers()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight">User Management</h2>
      <UsersTable users={users.map((u) => ({
        id: u.id,
        name: u.name ?? "No name",
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
      }))} />
    </div>
  )
}
