import { redirect } from "next/navigation"
import { getCurrentUser } from "./actions"
import type { User, Role } from "@prisma/client"

const permissions: Record<string, Role[]> = {
  "course:create": ["TEACHER", "ADMIN"],
  "course:edit": ["TEACHER", "ADMIN"],
  "course:publish": ["TEACHER", "ADMIN"],
  "course:delete": ["ADMIN"],
  "user:manage": ["ADMIN"],
  "user:role-change": ["ADMIN"],
  "enrollment:manage": ["ADMIN"],
  "analytics:view": ["TEACHER", "ADMIN"],
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export function can(
  user: User,
  action: string,
  resource?: { userId?: string; teacherId?: string }
): boolean {
  const allowedRoles = permissions[action]
  if (!allowedRoles) return false

  if (user.role === "ADMIN") return true

  if (!allowedRoles.includes(user.role)) return false

  // Ownership check for resource-scoped actions
  if (resource) {
    const ownerId = resource.teacherId ?? resource.userId
    if (ownerId && ownerId !== user.id) return false
  }

  return true
}
