import type { MetadataRoute } from "next"

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses", "/courses/", "/profile/", "/certificate/"],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/auth",
          "/auth/",
          "/checkout",
          "/checkout/",
          "/learn",
          "/learn/",
          "/api/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
