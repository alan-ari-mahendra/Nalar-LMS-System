"use server"

import crypto from "crypto"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from "./schemas"
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
} from "./schemas"

type ActionResult = { success: true; id?: string } | { success: false; error: string }

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const suffix = crypto.randomUUID().slice(0, 6)
  return `${base}-${suffix}`
}

export async function createCategory(data: CreateCategoryInput): Promise<ActionResult> {
  const parsed = CreateCategorySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { name, description, iconUrl } = parsed.data

  const cat = await prisma.category.create({
    data: {
      name,
      slug: slugify(name),
      description: description ?? null,
      iconUrl: iconUrl ?? null,
    },
  })

  revalidatePath("/dashboard/admin/categories")
  return { success: true, id: cat.id }
}

export async function updateCategory(data: UpdateCategoryInput): Promise<ActionResult> {
  const parsed = UpdateCategorySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { categoryId, name, description, iconUrl } = parsed.data

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) {
    updateData.name = name
    updateData.slug = slugify(name)
  }
  if (description !== undefined) updateData.description = description
  if (iconUrl !== undefined) updateData.iconUrl = iconUrl

  await prisma.category.update({ where: { id: categoryId }, data: updateData })

  revalidatePath("/dashboard/admin/categories")
  return { success: true }
}

export async function deleteCategory(data: DeleteCategoryInput): Promise<ActionResult> {
  const parsed = DeleteCategorySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { categoryId } = parsed.data

  const inUse = await prisma.course.count({
    where: { categoryId, deletedAt: null },
  })
  if (inUse > 0) {
    return {
      success: false,
      error: `Cannot delete — used by ${inUse} ${inUse === 1 ? "course" : "courses"}`,
    }
  }

  await prisma.category.delete({ where: { id: categoryId } })

  revalidatePath("/dashboard/admin/categories")
  return { success: true }
}
