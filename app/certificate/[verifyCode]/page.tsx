import Link from "next/link"
import { notFound } from "next/navigation"
import { getCertificateByCode } from "@/lib/queries"

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ verifyCode: string }>
}) {
  const { verifyCode } = await params
  const cert = await getCertificateByCode(verifyCode)
  if (!cert) notFound()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Certificate card */}
        <div className="relative bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-primary-container via-primary to-tertiary" />

          <div className="p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary !text-3xl">bolt</span>
                <span className="text-2xl font-bold text-on-surface tracking-tighter">Learnify</span>
              </div>

              <p className="text-xs text-on-surface-variant uppercase tracking-[0.3em] font-semibold">
                Certificate of Completion
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="material-symbols-outlined text-primary/30 !text-3xl">workspace_premium</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Body */}
            <div className="text-center space-y-6">
              <div>
                <p className="text-sm text-on-surface-variant mb-2">This certifies that</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                  {cert.student.fullName}
                </h2>
              </div>

              <p className="text-on-surface-variant">has successfully completed the course</p>

              <h3 className="text-xl md:text-2xl font-bold text-on-surface">
                {cert.course.title}
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-on-surface-variant pt-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base text-primary">calendar_today</span>
                  <span>
                    Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base text-primary">person</span>
                  <span>Instructor: {cert.instructor.fullName}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant" />

            {/* Bottom: QR + Verify */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* QR placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-outline rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline !text-2xl">qr_code_2</span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
                    Verification Code
                  </p>
                  <p className="text-sm font-mono font-bold text-on-surface">{cert.verifyCode}</p>
                </div>
              </div>

              {/* Download */}
              <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 transition-all">
                <span className="material-symbols-outlined !text-lg">download</span>
                Download PDF
              </button>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-tertiary/10 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Back link */}
        <p className="text-center">
          <Link href="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            &larr; Back to Learnify
          </Link>
        </p>
      </div>
    </div>
  )
}
