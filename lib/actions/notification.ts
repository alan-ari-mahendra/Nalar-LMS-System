"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import type { Notification } from "@/type"
import type { NotificationType } from "@prisma/client"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function getMyNotifications(): Promise<Notification[]> {
  const user = await requireAuth()
  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })
  return rows.map((n) => ({
    id: n.id,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    metadata: (n.metadata as Record<string, string> | null) ?? null,
    createdAt: n.createdAt.toISOString(),
  }))
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const user = await requireAuth()
  const notif = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true, isRead: true },
  })
  if (!notif || notif.userId !== user.id) {
    return { success: false, error: "Notification not found" }
  }
  if (!notif.isRead) {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }
  revalidatePath("/dashboard/notifications")
  return { success: true }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await requireAuth()
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })
  revalidatePath("/dashboard/notifications")
  return { success: true }
}
