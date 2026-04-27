"use client"

import Link from "next/link"

interface SidebarNavProps {
  role: "STUDENT" | "TEACHER" | "ADMIN"
  activePath: string
  unreadCount?: number
}

interface NavItem {
  label: string
  icon: string
  href: string
  badgeKey?: "notifications"
}

const studentLinks: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "My Courses", icon: "school", href: "/dashboard/courses" },
  { label: "Wishlist", icon: "favorite", href: "/dashboard/wishlist" },
  { label: "Certificates", icon: "workspace_premium", href: "/dashboard/certificates" },
  { label: "Orders", icon: "receipt_long", href: "/dashboard/orders" },
  { label: "Notifications", icon: "notifications", href: "/dashboard/notifications", badgeKey: "notifications" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

const instructorLinks: NavItem[] = [
  { label: "Overview", icon: "dashboard", href: "/dashboard/instructor" },
  { label: "My Courses", icon: "edit_note", href: "/dashboard/instructor/courses" },
  { label: "Students", icon: "group", href: "/dashboard/instructor/students" },
  { label: "Revenue", icon: "payments", href: "/dashboard/instructor/revenue" },
  { label: "Payouts", icon: "account_balance", href: "/dashboard/instructor/payouts" },
  { label: "Reviews", icon: "rate_review", href: "/dashboard/instructor/reviews" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

const adminLinks: NavItem[] = [
  { label: "Overview", icon: "dashboard", href: "/dashboard/admin" },
  { label: "Analytics", icon: "monitoring", href: "/dashboard/admin/analytics" },
  { label: "Users", icon: "manage_accounts", href: "/dashboard/admin/users" },
  { label: "Courses", icon: "menu_book", href: "/dashboard/admin/courses" },
  { label: "Categories", icon: "category", href: "/dashboard/admin/categories" },
  { label: "Coupons", icon: "local_offer", href: "/dashboard/admin/coupons" },
  { label: "Orders", icon: "receipt_long", href: "/dashboard/admin/orders" },
  { label: "Payouts", icon: "account_balance", href: "/dashboard/admin/payouts" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

export function SidebarNav({ role, activePath, unreadCount = 0 }: SidebarNavProps) {
  const links = role === "ADMIN" ? adminLinks : role === "TEACHER" ? instructorLinks : studentLinks

  // Pick the single best (longest) prefix match so /dashboard does not stay
  // active when the user is on /dashboard/courses, etc.
  const activeHref = links
    .filter((item) => activePath === item.href || activePath.startsWith(item.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {links.map((item) => {
        const isActive = item.href === activeHref
        const showBadge = item.badgeKey === "notifications" && unreadCount > 0

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-surface-container-high border-l-2 border-primary text-on-surface"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined !text-xl">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {showBadge && (
              <span className="min-w-[20px] h-[20px] px-1.5 inline-flex items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default SidebarNav
