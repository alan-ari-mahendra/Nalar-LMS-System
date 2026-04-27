import type { Metadata } from "next"
import { LegalPageShell } from "@/components/marketing/LegalPageShell"

export const metadata: Metadata = {
  title: "Privacy Policy — Learnify",
  description: "How Learnify collects and uses your personal data.",
}

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="April 27, 2026">
      <Section title="1. Data We Collect">
        We collect account information (name, email, password hash), course activity (progress,
        quiz attempts, certificates), and payment metadata (transaction IDs, amounts). We do
        not store full credit card numbers.
      </Section>
      <Section title="2. How We Use Data">
        Data is used to provide platform features, personalize learning, process payments, send
        transactional notifications, and improve service quality. We do not sell personal data
        to third parties.
      </Section>
      <Section title="3. Cookies">
        We use a session cookie to keep you logged in and minimal analytics cookies to monitor
        platform health. You can disable cookies in your browser, but core features may not
        function.
      </Section>
      <Section title="4. Email Communications">
        We send verification, password reset, and order confirmation emails. Marketing emails,
        if any, can be unsubscribed via the link in each message.
      </Section>
      <Section title="5. Data Retention">
        Account data is retained while your account is active. Deleted accounts are purged
        within 90 days, except where retention is required by law (e.g. tax records).
      </Section>
      <Section title="6. Your Rights">
        You may request a copy of your data, correction of inaccuracies, or deletion of your
        account at any time by contacting privacy@learnify.example.
      </Section>
      <Section title="7. Security">
        Passwords are hashed with bcrypt. Sessions are server-side. We use HTTPS for all
        connections and limit access to production data.
      </Section>
      <Section title="8. Children">
        Learnify is not intended for users under 13. We do not knowingly collect data from
        children under 13.
      </Section>
      <Section title="9. Updates">
        Policy changes will be notified via email or in-app banner before taking effect.
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
