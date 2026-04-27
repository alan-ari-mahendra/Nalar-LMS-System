import type { Metadata } from "next"
import { LegalPageShell } from "@/components/marketing/LegalPageShell"

export const metadata: Metadata = {
  title: "Terms of Service — Learnify",
  description: "Terms governing the use of the Learnify platform.",
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated="April 27, 2026">
      <Section title="1. Agreement">
        By accessing Learnify, you agree to these Terms of Service. If you do not agree, do not
        use the platform. These terms apply to students, instructors, and visitors.
      </Section>
      <Section title="2. Accounts">
        You are responsible for maintaining the confidentiality of your account credentials.
        Notify us immediately of any unauthorized access. We reserve the right to suspend
        accounts that violate these terms or applicable laws.
      </Section>
      <Section title="3. Course Enrollment">
        Paid courses grant lifetime access to enrolled students unless otherwise stated. Free
        courses may be modified or removed at the discretion of the instructor or platform.
      </Section>
      <Section title="4. Instructor Content">
        Instructors retain ownership of content they upload. By uploading, instructors grant
        Learnify a non-exclusive license to host, display, and distribute the content within
        the platform.
      </Section>
      <Section title="5. Payments">
        All payments are processed in IDR. Coupons may not be combined and are subject to the
        terms displayed at checkout. Refunds follow our Refund Policy.
      </Section>
      <Section title="6. Conduct">
        Do not post unlawful, harassing, or infringing content. Do not attempt to access or
        disrupt platform infrastructure. Violations may result in account termination.
      </Section>
      <Section title="7. Disclaimers">
        Learnify is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
        uninterrupted service or specific learning outcomes.
      </Section>
      <Section title="8. Changes">
        We may update these Terms periodically. Continued use after changes constitutes
        acceptance of the revised terms.
      </Section>
      <Section title="9. Contact">
        Questions about these Terms can be sent to legal@learnify.example.
      </Section>
    </LegalPageShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-on-surface mt-8 mb-3">{title}</h2>
      <p className="text-on-surface-variant leading-relaxed">{children}</p>
    </section>
  )
}
