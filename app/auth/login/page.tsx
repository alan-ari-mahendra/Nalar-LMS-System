"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { login } from "@/lib/auth/actions"

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    startTransition(async () => {
      const result = await login({ email, password })
      if (result.success) {
        router.push(result.redirectTo)
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
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Welcome back</h1>
        <p className="text-on-surface-variant mt-2">Sign in to continue your learning journey</p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container border border-outline-variant rounded-xl p-8 space-y-6"
      >
        {/* Error */}
        {error && (
          <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Email */}
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

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-on-surface">
                Password
              </label>
              <Link
                href="/auth/forgot"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
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
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-on-surface-variant">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary font-bold hover:underline">
          Sign up for free
        </Link>
      </p>
    </div>
  )
}
