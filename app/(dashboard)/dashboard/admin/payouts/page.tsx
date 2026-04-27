import { requireRole } from "@/lib/auth/guards"
import { getAllPayouts } from "@/lib/queries/payout"
import { AdminPayoutClient } from "./admin-payout-client"

export default async function AdminPayoutsPage() {
  await requireRole(["ADMIN"])
  const payouts = await getAllPayouts()

  return (
    <AdminPayoutClient
      payouts={payouts.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        accountHolder: p.accountHolder,
        note: p.note,
        rejectReason: p.rejectReason,
        requestedAt: p.requestedAt.toISOString(),
        processedAt: p.processedAt ? p.processedAt.toISOString() : null,
        instructor: {
          id: p.instructor.id,
          name: p.instructor.name,
          email: p.instructor.email,
          avatarUrl: p.instructor.avatarUrl,
        },
      }))}
    />
  )
}
