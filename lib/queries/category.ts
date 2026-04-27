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

export async function getCategoriesWithCounts() {
  const cats = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { courses: { where: { deletedAt: null } } } },
    },
  })
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    iconUrl: c.iconUrl,
    courseCount: c._count.courses,
    createdAt: c.createdAt,
  }))
}
