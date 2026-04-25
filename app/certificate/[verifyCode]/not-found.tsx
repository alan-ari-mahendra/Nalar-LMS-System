import Link from "next/link"

export default function CertificateNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
      <span className="material-symbols-outlined !text-5xl text-on-surface-variant mb-4 opacity-40">verified</span>
      <h2 className="text-xl font-bold text-on-surface mb-2">Certificate not found</h2>
      <p className="text-sm text-on-surface-variant mb-6">
        This verification code is invalid or the certificate has been revoked.
      </p>
      <Link
        href="/"
        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all"
      >
        Back to Home
      </Link>
    </div>
  )
}
