export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* TODO: Replace with <SidebarNav /> from components/dashboard/SidebarNav.tsx */}
      <aside className="hidden lg:flex w-[240px] flex-col border-r border-outline-variant bg-surface-container" />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
