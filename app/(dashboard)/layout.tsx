import { getCurrentUser } from "@/lib/auth/actions"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell
      user={{
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  )
}
