import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
        <div className="bg-surface-container border border-outline-variant rounded-xl p-8 space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-on-surface">
                Email address
              </label>
              <input
                id="email"
                type="email"
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
                <button className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>
          </div>

          {/* Submit */}
          <button className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all">
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant">or continue with</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Google OAuth placeholder */}
          <button className="w-full flex items-center justify-center gap-2 border border-outline-variant bg-surface-container-low py-3 rounded-lg font-medium text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined !text-lg">language</span>
            Google
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
