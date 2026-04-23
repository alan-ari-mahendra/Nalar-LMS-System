import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary !text-3xl">bolt</span>
            <span className="text-2xl font-bold text-on-surface tracking-tighter">Learnify</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Create your account</h1>
          <p className="text-on-surface-variant mt-2">Start learning from industry experts today</p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-8 space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-on-surface">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Alan Ari Mahendra"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>

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
              <label htmlFor="password" className="text-sm font-medium text-on-surface">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>

            {/* Role selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-on-surface">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="role"
                    value="STUDENT"
                    defaultChecked
                    className="text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-highest border-outline-variant"
                  />
                  <div>
                    <span className="material-symbols-outlined text-primary !text-lg block mb-1">school</span>
                    <span className="text-sm font-bold text-on-surface">Learn</span>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Enroll in courses</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-xl cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="role"
                    value="INSTRUCTOR"
                    className="text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-highest border-outline-variant"
                  />
                  <div>
                    <span className="material-symbols-outlined text-primary !text-lg block mb-1">video_library</span>
                    <span className="text-sm font-bold text-on-surface">Teach</span>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Create courses</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all">
            Create Account
          </button>

          {/* Terms */}
          <p className="text-[10px] text-center text-on-surface-variant leading-relaxed">
            By creating an account, you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
