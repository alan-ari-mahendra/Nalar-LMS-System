"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { Avatar } from "@/components/shared/Avatar"
import { NotificationBell } from "@/components/shared/NotificationBell"
import { MOCK_CURRENT_USER, MOCK_NOTIFICATIONS } from "@/mock/data"

const user = MOCK_CURRENT_USER
const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length

function SidebarContent({ role, pathname }: { role: "STUDENT" | "INSTRUCTOR" | "ADMIN"; pathname: string }) {
  return (
    <>
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary">school</span>
        </div>
        <div className="flex flex-col">
          <Link href="/" className="text-xl font-bold text-primary tracking-tighter">Learnify</Link>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
            {role === "INSTRUCTOR" ? "Instructor Panel" : "Student Portal"}
          </span>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant">
          <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
          <div>
            <p className="text-sm font-bold text-on-surface">{user.fullName.split(" ")[0]}</p>
            <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded border border-primary/30 uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <SidebarNav role={role} activePath={pathname} />

      {/* Logout */}
      <div className="p-4 mt-auto border-t border-outline-variant">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error transition-colors">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = pathname.startsWith("/dashboard/instructor") ? "INSTRUCTOR" as const : "STUDENT" as const

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-[240px] flex-col border-r border-outline-variant bg-surface shrink-0 fixed top-0 left-0 h-full z-50">
        <SidebarContent role={role} pathname={pathname} />
      </aside>

      {/* Sidebar — mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[240px] max-w-[80vw] bg-surface border-r border-outline-variant flex flex-col h-full z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <SidebarContent role={role} pathname={pathname} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-4 lg:px-8 py-4 bg-background/80 backdrop-blur-md border-b border-outline-variant">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline !text-sm">search</span>
              <input
                type="text"
                className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-outline"
                placeholder="Search courses, lessons, or resources..."
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <NotificationBell count={unreadCount} />
            <div className="h-8 w-px bg-outline-variant hidden sm:block" />
            <div className="hidden sm:flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
              <span className="text-sm font-medium text-on-surface">
                {user.fullName.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
