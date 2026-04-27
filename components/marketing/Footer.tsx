import Link from "next/link"

type FooterLink =
  | { label: string; href: string; disabled?: false }
  | { label: string; disabled: true }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Browse Courses", href: "/courses" },
      { label: "Learning Paths", disabled: true },
      { label: "For Enterprise", disabled: true },
      { label: "Become Instructor", disabled: true },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Blog", disabled: true },
      { label: "Forum", disabled: true },
      { label: "Events", disabled: true },
      { label: "Discord", disabled: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", disabled: true },
      { label: "Documentation", disabled: true },
      { label: "API", disabled: true },
      { label: "Status", disabled: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
]

const socialIcons = ["language", "smart_display", "forum", "mail"]

export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold text-on-surface mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.disabled ? (
                      <a
                        aria-disabled="true"
                        className="text-sm text-on-surface-variant opacity-50 cursor-not-allowed"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary !text-xl">bolt</span>
            <span className="text-sm text-on-surface-variant">
              &copy; {new Date().getFullYear()} Learnify. Platform for Learning.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {socialIcons.map((icon) => (
              <button
                key={icon}
                className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                aria-label={icon}
              >
                <span className="material-symbols-outlined !text-lg">{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
