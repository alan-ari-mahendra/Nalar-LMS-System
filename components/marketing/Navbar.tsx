"use client"

import Link from "next/link"
import { useState } from "react"

type NavLink =
  | { label: string; href: string; disabled?: false }
  | { label: string; disabled: true }

const navLinks: NavLink[] = [
  { label: "Courses", href: "/courses" },
  { label: "Paths", disabled: true },
  { label: "Mentors", disabled: true },
  { label: "Enterprise", disabled: true },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-outline-variant bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary !text-2xl">bolt</span>
            <span className="text-lg font-bold text-on-surface">Learnify</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.disabled ? (
                <a
                  key={link.label}
                  aria-disabled="true"
                  className="text-sm text-on-surface-variant opacity-50 cursor-not-allowed"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-on-surface-variant"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface-container">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) =>
              link.disabled ? (
                <a
                  key={link.label}
                  aria-disabled="true"
                  className="block text-sm text-on-surface-variant opacity-50 cursor-not-allowed py-2"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-on-surface-variant hover:text-on-surface py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-3 border-t border-outline-variant flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-on-surface-variant text-center py-2"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium text-center hover:brightness-110 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
