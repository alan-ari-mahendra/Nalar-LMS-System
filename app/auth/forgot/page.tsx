"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { requestPasswordReset } from "@/lib/auth/actions"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    startTransition(async () => {
      const result = await requestPasswordReset({ email })
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Brand */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary !text-3xl">bolt</span>
          <span className="text-2xl font-bold text-on-surface tracking-tighter">Learnify</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Forgot password?</h1>
        <p className="text-on-surface-variant mt-2">
          We&apos;ll send a reset link to your email
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-8 space-y-6">
        {submitted ? (
          <div className="space-y-4 text-center">
            <span className="material-symbols-outlined text-tertiary !text-5xl">mark_email_read</span>
            <h2 className="text-xl font-bold text-on-surface">Check your inbox</h2>
            <p className="text-on-surface-variant text-sm">
              If an account exists for that email, a password reset link has been sent. The link
              expires in 1 hour.
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
              <label htmlFor="email" className="text-sm font-medium text-on-surface">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-on-surface-variant">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-primary font-bold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
