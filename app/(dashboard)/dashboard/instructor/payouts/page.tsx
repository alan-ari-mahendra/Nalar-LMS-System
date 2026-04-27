import { requireRole } from "@/lib/auth/guards"
import { getInstructorBalance } from "@/lib/actions/payout"
import { getPayoutsByInstructor } from "@/lib/queries/payout"
import { PayoutClient } from "./payout-client"

export default async function InstructorPayoutsPage() {
  const user = await requireRole(["TEACHER", "ADMIN"])
  const [balance, payouts] = await Promise.all([
    getInstructorBalance(user.id),
    getPayoutsByInstructor(user.id),
  ])

  return (
    <PayoutClient
      balance={balance}
      defaultName={user.name ?? ""}
      payouts={payouts.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        accountHolder: p.accountHolder,
        rejectReason: p.rejectReason,
        requestedAt: p.requestedAt.toISOString(),
        processedAt: p.processedAt ? p.processedAt.toISOString() : null,
      }))}
    />
  )
}
