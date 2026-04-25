"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/shared/Avatar"
import { toggleUserActive, changeUserRole } from "@/lib/actions/admin"
import { formatRelativeTime } from "@/lib/utils"

interface UserRow {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: "STUDENT" | "TEACHER" | "ADMIN"
  isActive: boolean
  createdAt: string
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleToggleActive(userId: string) {
    startTransition(async () => {
      await toggleUserActive({ userId })
      router.refresh()
    })
  }

  function handleRoleChange(userId: string, role: "STUDENT" | "TEACHER" | "ADMIN") {
    startTransition(async () => {
      await changeUserRole({ userId, role })
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-surface-variant/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-on-surface-variant">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as "STUDENT" | "TEACHER" | "ADMIN")}
                    disabled={isPending}
                    className="bg-surface-container-low border border-outline-variant rounded px-2 py-1 text-xs font-bold disabled:opacity-50">
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.isActive ? "bg-tertiary-container text-tertiary" : "bg-error-container text-on-error-container"}`}>
                    {user.isActive ? "Active" : "Banned"}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-on-surface-variant">{formatRelativeTime(user.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleToggleActive(user.id)} disabled={isPending}
                    className={`text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${
                      user.isActive ? "text-error hover:bg-error-container" : "text-tertiary hover:bg-tertiary-container"
                    }`}>
                    {user.isActive ? "Ban" : "Unban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
