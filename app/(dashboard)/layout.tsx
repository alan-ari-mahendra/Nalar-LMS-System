import { getCurrentUser } from "@/lib/auth/actions"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { EmailVerifyBanner } from "@/components/dashboard/EmailVerifyBanner"
import { getNotificationsByUser } from "@/lib/queries"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const notifications = await getNotificationsByUser(user.id)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <DashboardShell
      user={{
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }}
      unreadCount={unreadCount}
    >
      {!user.emailVerified && <EmailVerifyBanner email={user.email} />}
      {children}
    </DashboardShell>
  )
}
