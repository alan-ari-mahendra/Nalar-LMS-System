import { Navbar } from "@/components/marketing/Navbar"
import { Footer } from "@/components/marketing/Footer"
import { getCurrentUser } from "@/lib/auth/actions"
import type { Role } from "@prisma/client"

const roleHome: Record<Role, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/instructor",
  STUDENT: "/dashboard",
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const sessionUser = user
    ? {
        name: user.name,
        avatarUrl: user.avatarUrl,
        dashboardHref: roleHome[user.role],
      }
    : null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={sessionUser} />

      <main className="flex-1 pt-16">{children}</main>

      <Footer />
    </div>
  )
}
