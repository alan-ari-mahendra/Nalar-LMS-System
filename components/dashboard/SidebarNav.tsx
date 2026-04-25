"use client"

import Link from "next/link"

interface SidebarNavProps {
  role: "STUDENT" | "TEACHER" | "ADMIN"
  activePath: string
}

interface NavItem {
  label: string
  icon: string
  href: string
}

const studentLinks: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "My Courses", icon: "school", href: "/dashboard/courses" },
  { label: "Certificates", icon: "workspace_premium", href: "/dashboard/certificates" },
  { label: "Notifications", icon: "notifications", href: "/dashboard/notifications" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

const instructorLinks: NavItem[] = [
  { label: "Overview", icon: "dashboard", href: "/dashboard/instructor" },
  { label: "My Courses", icon: "edit_note", href: "/dashboard/instructor/courses" },
  { label: "Students", icon: "group", href: "/dashboard/instructor/students" },
  { label: "Revenue", icon: "payments", href: "/dashboard/instructor/revenue" },
  { label: "Reviews", icon: "rate_review", href: "/dashboard/instructor/reviews" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

const adminLinks: NavItem[] = [
  { label: "Overview", icon: "dashboard", href: "/dashboard/instructor" },
  { label: "Users", icon: "manage_accounts", href: "/dashboard/admin/users" },
  { label: "Courses", icon: "menu_book", href: "/dashboard/admin/courses" },
  { label: "My Courses", icon: "edit_note", href: "/dashboard/instructor/courses" },
  { label: "Revenue", icon: "payments", href: "/dashboard/instructor/revenue" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

export function SidebarNav({ role, activePath }: SidebarNavProps) {
  const links = role === "ADMIN" ? adminLinks : role === "TEACHER" ? instructorLinks : studentLinks

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {links.map((item) => {
        const isActive = activePath === item.href || activePath.startsWith(item.href + "/")

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
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default SidebarNav
