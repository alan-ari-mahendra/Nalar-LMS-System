"use client"

import { useRef, useState, useTransition } from "react"
import { changePassword } from "@/lib/auth/actions"

const inputClass =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    const fd = new FormData(e.currentTarget)
    const payload = {
      currentPassword: String(fd.get("currentPassword") ?? ""),
      newPassword: String(fd.get("newPassword") ?? ""),
      confirmPassword: String(fd.get("confirmPassword") ?? ""),
    }

    startTransition(async () => {
      const result = await changePassword(payload)
      if (result.success) {
        setSuccess(true)
        formRef.current?.reset()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <section className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Security</h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Change your password to keep your account secure.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-tertiary-container border border-tertiary/30 rounded-lg px-4 py-3 text-on-tertiary-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined !text-base">check_circle</span>
            Password updated successfully
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="text-sm font-medium text-on-surface">
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium text-on-surface">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className={inputClass}
          />
          <p className="text-xs text-on-surface-variant">
            Minimum 8 characters, must include uppercase and a number.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-on-surface">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  )
}
