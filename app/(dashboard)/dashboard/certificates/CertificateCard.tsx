"use client"

import Link from "next/link"
import { useState } from "react"
import type { Certificate } from "@/type"

interface CertificateCardProps {
  certificate: Certificate
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [copied, setCopied] = useState(false)

  const issued = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  async function handleShare() {
    const url = `${window.location.origin}/certificate/${certificate.verifyCode}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden flex flex-col group hover:border-primary/40 transition-all">
      <div className="h-2 bg-gradient-to-r from-primary/20 to-tertiary/10" />

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined !text-3xl text-primary">workspace_premium</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-on-surface line-clamp-2">{certificate.course.title}</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Issued by {certificate.instructor.fullName}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">{issued}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <Link
            href={`/certificate/${certificate.verifyCode}`}
            className="flex-1 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg text-center hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined !text-base">visibility</span>
            View Certificate
          </Link>
          <button
            onClick={handleShare}
            className="flex-1 py-2 border border-outline-variant bg-surface-container-low text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined !text-base">
              {copied ? "check" : "share"}
            </span>
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </div>
    </div>
  )
}
