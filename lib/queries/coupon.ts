import { prisma } from "@/lib/db"

export async function getAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  })
}
