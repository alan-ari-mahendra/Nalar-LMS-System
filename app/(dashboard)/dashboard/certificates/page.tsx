import Link from "next/link"
import { requireAuth } from "@/lib/auth/guards"
import { getMyCertificates } from "@/lib/actions/enrollment"
import { CertificateCard } from "./CertificateCard"

export default async function CertificatesPage() {
  await requireAuth()
  const certificates = await getMyCertificates()

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">My Certificates</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Earned credentials from completed courses.
          </p>
        </div>
        <span className="px-3 py-1 bg-primary/15 text-primary text-sm font-bold rounded-full border border-primary/30">
          {certificates.length} {certificates.length === 1 ? "certificate" : "certificates"}
        </span>
      </header>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">workspace_premium</span>
          <h2 className="text-on-surface font-bold mb-1">No certificates yet</h2>
          <p className="text-sm mb-6 text-center max-w-sm">
            Complete a course to earn your first certificate.
          </p>
          <Link
            href="/dashboard/courses"
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:brightness-110 transition-all"
          >
            View My Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  )
}
