interface LegalPageShellProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPageShell({ title, lastUpdated, children }: LegalPageShellProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">{title}</h1>
        <p className="text-sm text-on-surface-variant mt-2">Last updated: {lastUpdated}</p>
      </header>
      <div className="prose prose-invert max-w-none text-on-surface space-y-6">{children}</div>
    </div>
  )
}
