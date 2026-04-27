import type { Metadata } from "next"
import { LegalPageShell } from "@/components/marketing/LegalPageShell"

export const metadata: Metadata = {
  title: "Refund Policy — Learnify",
  description: "Refund eligibility and process for Learnify courses.",
}

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund Policy" lastUpdated="April 27, 2026">
      <Section title="1. Eligibility">
        Refunds are available within 7 days of purchase, provided you have completed less than
        20% of the course. Refunds are issued to the original payment method.
      </Section>
      <Section title="2. How to Request">
        Email refunds@learnify.example with your order ID and reason. We respond within 3
        business days.
      </Section>
      <Section title="3. Non-Refundable">
        Courses completed past the 20% threshold, certificates already issued, and discounted
        purchases below Rp 50,000 are not eligible for refund.
      </Section>
      <Section title="4. Processing Time">
        Approved refunds are processed within 7 business days. Bank settlement may take
        additional time depending on the payment provider.
      </Section>
      <Section title="5. Disputes">
        If you disagree with a refund decision, you may escalate to support@learnify.example.
        Decisions made in good faith are final after review.
      </Section>
      <Section title="6. Coupon Discounts">
        Refunds for orders with applied coupons are issued at the discounted amount actually
        paid, not the course&apos;s original list price.
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
