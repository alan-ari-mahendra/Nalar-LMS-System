"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notification"
import type { Notification, NotificationType } from "@/type"

interface NotificationsClientProps {
  initialNotifications: Notification[]
}

const iconMap: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  ENROLLMENT: { icon: "bookmark_add", color: "text-primary", bg: "bg-primary/15" },
  COURSE_APPROVED: { icon: "verified", color: "text-tertiary", bg: "bg-tertiary/15" },
  COURSE_REJECTED: { icon: "cancel", color: "text-error", bg: "bg-error/15" },
  QUIZ_PASSED: { icon: "quiz", color: "text-tertiary", bg: "bg-tertiary/15" },
  QUIZ_FAILED: { icon: "quiz", color: "text-error", bg: "bg-error/15" },
  CERTIFICATE_ISSUED: { icon: "workspace_premium", color: "text-primary", bg: "bg-primary/15" },
  NEW_REVIEW: { icon: "star", color: "text-amber-400", bg: "bg-amber-400/15" },
  COURSE_UPDATE: { icon: "update", color: "text-on-surface-variant", bg: "bg-surface-container-high" },
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  const wk = Math.floor(day / 7)
  if (wk < 4) return `${wk}w ago`
  return new Date(iso).toLocaleDateString()
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<Notification[]>(initialNotifications)
  const [, startTransition] = useTransition()

  const unreadCount = items.filter((n) => !n.isRead).length

  function handleClick(notif: Notification) {
    if (!notif.isRead) {
      // Optimistic update
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)))
      startTransition(async () => {
        await markNotificationRead(notif.id)
      })
    }

    const courseId = notif.metadata?.courseId
    if (courseId) {
      router.push(`/dashboard/courses`)
    }
  }

  function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    startTransition(async () => {
      await markAllNotificationsRead()
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 bg-primary/15 text-primary text-sm font-bold rounded-full border border-primary/30">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined !text-base">done_all</span>
            Mark all as read
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">notifications_off</span>
          <p className="text-sm">You&apos;re all caught up</p>
        </div>
      ) : (
        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
          {items.map((n) => (
            <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification
  onClick: () => void
}) {
  const meta = iconMap[notification.type] ?? iconMap.COURSE_UPDATE
  const bg = notification.isRead ? "bg-surface-container" : "bg-surface-container-high"

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-4 text-left ${bg} hover:bg-surface-container-highest transition-colors`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
        <span className={`material-symbols-outlined !text-xl ${meta.color}`}>{meta.icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface">{notification.title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{notification.message}</p>
        <p className="text-xs text-on-surface-variant mt-1">{formatRelative(notification.createdAt)}</p>
      </div>

      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" aria-label="unread" />
      )}
    </button>
  )
}
