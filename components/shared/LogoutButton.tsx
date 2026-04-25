"use client"

import { useTransition } from "react"
import { logout } from "@/lib/auth/actions"

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
      window.location.href = "/auth/login"
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={className ?? "flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"}
    >
      {children ?? (
        <>
          <span className="material-symbols-outlined !text-xl">logout</span>
          <span>{isPending ? "Signing out..." : "Sign Out"}</span>
        </>
      )}
    </button>
  )
}
