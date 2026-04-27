"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { register } from "@/lib/auth/actions"

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    startTransition(async () => {
      const result = await register({ name, email, password, role })
      if (result.success) {
        router.push(result.redirectTo)
      } else {
        setError(result.error)
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
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Create your account</h1>
        <p className="text-on-surface-variant mt-2">Start learning from industry experts today</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-surface-container border border-outline-variant rounded-xl p-8 space-y-6"
      >
        {error && (
          <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-on-surface">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Alan Ari Mahendra"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            />
          </div>

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

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-on-surface">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min. 8 characters"
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-on-surface">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors ${
                  role === "STUDENT"
                    ? "border-primary bg-surface-container-high"
                    : "border-outline-variant bg-surface-container-low hover:border-primary/50"
                }`}
              >
                <span className="material-symbols-outlined text-primary !text-2xl">school</span>
                <span className="text-sm font-bold text-on-surface">Student</span>
                <p className="text-[10px] text-on-surface-variant">I want to learn</p>
              </button>
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors ${
                  role === "TEACHER"
                    ? "border-primary bg-surface-container-high"
                    : "border-outline-variant bg-surface-container-low hover:border-primary/50"
                }`}
              >
                <span className="material-symbols-outlined text-primary !text-2xl">cast_for_education</span>
                <span className="text-sm font-bold text-on-surface">Teacher</span>
                <p className="text-[10px] text-on-surface-variant">I want to teach</p>
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-[10px] text-center text-on-surface-variant leading-relaxed">
          By creating an account, you agree to our{" "}
          <span className="text-on-surface-variant cursor-not-allowed" title="Coming soon">Terms of Service</span> and{" "}
          <span className="text-on-surface-variant cursor-not-allowed" title="Coming soon">Privacy Policy</span>.
        </p>
      </form>

      <p className="text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
