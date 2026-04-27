import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db"

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: { slug: true, updatedAt: true },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${APP_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${APP_URL}/refund`, changeFrequency: "monthly", priority: 0.3 },
  ]

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${APP_URL}/courses/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...courseRoutes]
}
