import { Suspense } from "react"
import { ResetPasswordForm } from "./ResetPasswordForm"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordFallback() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-8">
        <div className="h-32 animate-pulse bg-surface-container-high rounded" />
      </div>
    </div>
  )
}
