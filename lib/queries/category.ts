import { prisma } from "@/lib/db"

/** Get all categories */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}
