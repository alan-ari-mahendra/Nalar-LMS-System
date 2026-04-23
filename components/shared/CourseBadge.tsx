import type { CourseStatus } from "@/type"

interface CourseBadgeProps {
  label: string
  variant: "category" | "level" | "free" | "status"
  /** Required when variant="status" to determine color */
  status?: CourseStatus
}

const statusColors: Record<CourseStatus, string> = {
  PUBLISHED: "bg-tertiary-container text-tertiary",
  DRAFT: "bg-amber-500/20 text-amber-500",
  PENDING_REVIEW: "bg-primary/20 text-primary",
  ARCHIVED: "bg-secondary-container text-on-secondary-container",
}

export function CourseBadge({ label, variant, status }: CourseBadgeProps) {
  let classes: string

  switch (variant) {
    case "category":
    case "level":
      classes = "bg-surface-container-highest text-on-surface-variant"
      break
    case "free":
      classes = "bg-tertiary-container text-tertiary"
      break
    case "status":
      classes = status ? statusColors[status] : statusColors.PUBLISHED
      break
  }

  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${classes}`}
    >
      {label}
    </span>
  )
}

export default CourseBadge
