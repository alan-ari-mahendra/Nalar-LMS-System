import { requireRole } from "@/lib/auth/guards"
import { getAllCoupons } from "@/lib/queries/coupon"
import { CouponsClient } from "./coupons-client"

export default async function AdminCouponsPage() {
  await requireRole(["ADMIN"])
  const coupons = await getAllCoupons()
  return (
    <CouponsClient
      coupons={coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discountPercent: c.discountPercent,
        maxUses: c.maxUses,
        usedCount: c.usedCount,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        isActive: c.isActive,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  )
}
