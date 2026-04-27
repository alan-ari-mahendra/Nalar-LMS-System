import Link from "next/link"
import { verifyEmail } from "@/lib/auth/actions"

type SearchParams = Promise<{ token?: string }>

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { token } = await searchParams
  const result = token
    ? await verifyEmail({ token })
    : { success: false as const, error: "Verification link is invalid or missing" }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary !text-3xl">bolt</span>
          <span className="text-2xl font-bold text-on-surface tracking-tighter">Learnify</span>
        </Link>
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl p-8 space-y-6 text-center">
        {result.success ? (
          <>
            <span className="material-symbols-outlined text-tertiary !text-5xl">verified</span>
            <h1 className="text-2xl font-bold text-on-surface">Email verified</h1>
            <p className="text-on-surface-variant text-sm">
              Your email is now verified. You can continue using your account.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all"
            >
              Go to dashboard
            </Link>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-error !text-5xl">error</span>
            <h1 className="text-2xl font-bold text-on-surface">Verification failed</h1>
            <p className="text-on-surface-variant text-sm">{result.error}</p>
            <Link
              href="/auth/login"
              className="inline-block border border-outline-variant bg-surface-container-low text-on-surface px-6 py-3 rounded-lg font-bold hover:bg-surface-container transition-all"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
