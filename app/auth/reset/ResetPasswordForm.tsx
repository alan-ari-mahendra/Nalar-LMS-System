"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { resetPassword } from "@/lib/auth/actions"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [isPending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState("")
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const error = submitError || (!token ? "Reset link is invalid or missing" : "")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError("")

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    startTransition(async () => {
      const result = await resetPassword({ token, newPassword, confirmPassword })
      if (result.success) {
        setDone(true)
        setTimeout(() => router.push("/auth/login"), 2500)
      } else {
        setSubmitError(result.error)
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary !text-3xl">bolt</span>
          <span className="text-2xl font-bold text-on-surface tracking-tighter">Learnify</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Set new password</h1>
        <p className="text-on-surface-variant mt-2">
          Choose a strong password for your account
        </p>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-8 space-y-6">
        {done ? (
          <div className="space-y-4 text-center">
            <span className="material-symbols-outlined text-tertiary !text-5xl">check_circle</span>
            <h2 className="text-xl font-bold text-on-surface">Password updated</h2>
            <p className="text-on-surface-variant text-sm">
              Your password has been reset. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-on-surface">
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-12 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined !text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">
                Min 8 chars, one uppercase, one number
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-on-surface">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !token}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Updating..." : "Reset password"}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-on-surface-variant">
        <Link href="/auth/login" className="text-primary font-bold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
