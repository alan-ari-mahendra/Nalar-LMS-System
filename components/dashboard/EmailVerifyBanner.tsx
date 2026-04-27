"use client"

import { useState, useTransition } from "react"
import { resendVerification } from "@/lib/auth/actions"

export function EmailVerifyBanner({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  function handleResend() {
    startTransition(async () => {
      await resendVerification({ email })
      setSent(true)
    })
  }

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <span className="material-symbols-outlined text-primary !text-xl shrink-0">mail</span>
        <p className="text-sm text-on-surface min-w-0">
          {sent ? (
            <>Verification email sent. Check your inbox.</>
          ) : (
            <>
              Please verify your email address. Check <span className="font-semibold">{email}</span> for the verification link.
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!sent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="text-sm font-bold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Sending..." : "Resend"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined !text-xl">close</span>
        </button>
      </div>
    </div>
  )
}
