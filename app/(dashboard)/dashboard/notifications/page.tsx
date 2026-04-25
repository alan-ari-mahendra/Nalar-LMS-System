import { requireAuth } from "@/lib/auth/guards"
import { getMyNotifications } from "@/lib/actions/notification"
import { NotificationsClient } from "./NotificationsClient"

export default async function NotificationsPage() {
  await requireAuth()
  const notifications = await getMyNotifications()

  return <NotificationsClient initialNotifications={notifications} />
}
