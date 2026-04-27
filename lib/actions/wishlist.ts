"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { WishlistCourseSchema } from "./schemas"
import type { WishlistCourseInput } from "./schemas"

type ActionResult = { success: true } | { success: false; error: string }

export async function addToWishlist(data: WishlistCourseInput): Promise<ActionResult> {
  const parsed = WishlistCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireAuth()
  const { courseId } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { id: true },
  })
  if (!course) return { success: false, error: "Course not found" }

  await prisma.wishlistItem.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId },
    update: {},
  })

  revalidatePath("/dashboard/wishlist")
  return { success: true }
}

export async function removeFromWishlist(data: WishlistCourseInput): Promise<ActionResult> {
  const parsed = WishlistCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireAuth()
  const { courseId } = parsed.data

  await prisma.wishlistItem
    .delete({ where: { userId_courseId: { userId: user.id, courseId } } })
    .catch(() => {})

  revalidatePath("/dashboard/wishlist")
  return { success: true }
}
