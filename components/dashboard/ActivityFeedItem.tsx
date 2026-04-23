import type { ActivityItem } from "@/type"
import { formatRelativeTime } from "@/mock/data"

interface ActivityFeedItemProps {
  item: ActivityItem
}

const iconMap: Record<ActivityItem["type"], string> = {
  LESSON_COMPLETED: "check_circle",
  CERTIFICATE_EARNED: "workspace_premium",
  QUIZ_PASSED: "quiz",
  ENROLLED: "bookmark_add",
}

const colorMap: Record<ActivityItem["type"], string> = {
  LESSON_COMPLETED: "text-tertiary",
  CERTIFICATE_EARNED: "text-primary",
  QUIZ_PASSED: "text-primary",
  ENROLLED: "text-tertiary",
}

export function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-0.5 shrink-0 ${colorMap[item.type]}`}>
        <span className="material-symbols-outlined !text-xl">
          {iconMap[item.type]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface leading-snug">{item.message}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>
    </div>
  )
}

export default ActivityFeedItem
