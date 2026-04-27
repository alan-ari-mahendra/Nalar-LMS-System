import { requireRole } from "@/lib/auth/guards"
import { getPlatformAnalytics } from "@/lib/queries/analytics"
import { AnalyticsClient } from "./analytics-client"

export default async function AdminAnalyticsPage() {
  await requireRole(["ADMIN"])
  const data = await getPlatformAnalytics()
  return <AnalyticsClient data={data} />
}
