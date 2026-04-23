"use client"

interface NotificationBellProps {
  count: number
  onClick?: () => void
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  const display = count > 9 ? "9+" : String(count)

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
      aria-label={`Notifications: ${count} unread`}
    >
      <span className="material-symbols-outlined">notifications</span>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold leading-none">
          {display}
        </span>
      )}
    </button>
  )
}

export default NotificationBell
