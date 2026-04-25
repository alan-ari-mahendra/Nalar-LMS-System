import { prisma } from "@/lib/db"

export interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  iconUrl: string | null
  createdAt: Date
  updatedAt: Date
}

/** Get all categories */
export async function getCategories(): Promise<CategoryRow[]> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}
