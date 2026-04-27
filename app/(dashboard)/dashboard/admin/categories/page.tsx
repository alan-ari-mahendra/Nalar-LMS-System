import { requireRole } from "@/lib/auth/guards"
import { getCategoriesWithCounts } from "@/lib/queries/category"
import { CategoriesClient } from "./categories-client"

export default async function AdminCategoriesPage() {
  await requireRole(["ADMIN"])
  const categories = await getCategoriesWithCounts()
  return <CategoriesClient categories={categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))} />
}
