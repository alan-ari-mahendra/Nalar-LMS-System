# Phase 4-5 Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add course builder (form-based CRUD), admin panel (users + course approval), quiz UI in player, certificate print, and sidebar navigation updates to complete Learnify as a portfolio-ready LMS.

**Architecture:** Extends existing patterns — server actions in `lib/actions/`, queries in `lib/queries/`, Zod schemas in `lib/actions/schemas.ts`. New pages follow dashboard route group conventions. All actions use `requireRole()` guards and `prisma.$transaction` where needed.

**Tech Stack:** Next.js 16 (App Router), Prisma 7 + Neon PostgreSQL, Zod 4, TypeScript strict.

**Spec:** `docs/superpowers/specs/2026-04-25-phase4-5-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `lib/actions/admin.ts` | Admin actions: toggleUserActive, changeUserRole, approveCourse, rejectCourse |
| `lib/queries/admin.ts` | Admin queries: getAllUsers, getAllCourses (with status filter) |
| `app/(dashboard)/dashboard/instructor/courses/page.tsx` | Instructor's course list |
| `app/(dashboard)/dashboard/instructor/courses/new/page.tsx` | Create course form |
| `app/(dashboard)/dashboard/instructor/courses/[courseId]/page.tsx` | Edit course + chapters/lessons |
| `app/(dashboard)/dashboard/instructor/courses/[courseId]/edit-client.tsx` | Client component for course editing |
| `app/(dashboard)/dashboard/admin/page.tsx` | Admin redirect to users |
| `app/(dashboard)/dashboard/admin/users/page.tsx` | User management |
| `app/(dashboard)/dashboard/admin/users/users-client.tsx` | Client component for user table |
| `app/(dashboard)/dashboard/admin/courses/page.tsx` | Course approval |
| `app/(dashboard)/dashboard/admin/courses/courses-client.tsx` | Client component for course table |

### Modified Files

| File | Changes |
|------|---------|
| `lib/actions/schemas.ts` | Add course builder + admin schemas |
| `lib/actions/course.ts` | Add createCourse, updateCourse, chapter/lesson CRUD, recalculateCourseCounts |
| `lib/queries/index.ts` | Export new query functions |
| `lib/queries/lesson.ts` | Add getQuizByLessonId |
| `components/dashboard/SidebarNav.tsx` | Add admin + instructor nav items |
| `app/(player)/learn/[courseId]/[lessonId]/page.tsx` | Pass quiz data to client |
| `app/(player)/learn/[courseId]/[lessonId]/player-client.tsx` | Add quiz UI |
| `app/certificate/[verifyCode]/page.tsx` | Add print button + print styles |
| `app/globals.css` | Add @media print styles |

---

## Task 1: Course Builder Schemas

**Files:**
- Modify: `lib/actions/schemas.ts`

- [ ] **Step 1: Add course builder + admin validation schemas**

Append to the existing `lib/actions/schemas.ts`:

```typescript
// --- Course Builder Schemas ---

export const CreateCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10).max(5000),
  shortDesc: z.string().min(10).max(500),
  price: z.number().min(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  categoryId: z.string().min(1),
  thumbnailUrl: z.string().url("Must be a valid URL"),
})

export const UpdateCourseSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  shortDesc: z.string().min(10).max(500).optional(),
  price: z.number().min(0).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  categoryId: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().optional(),
})

export const CreateChapterSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1, "Chapter title required").max(200),
  description: z.string().max(1000).optional(),
})

export const UpdateChapterSchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
})

export const DeleteChapterSchema = z.object({
  chapterId: z.string().min(1),
})

export const CreateLessonSchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1, "Lesson title required").max(200),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "ATTACHMENT"]),
  content: z.string().max(50000).optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
})

export const UpdateLessonSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "ATTACHMENT"]).optional(),
  content: z.string().max(50000).optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
})

export const DeleteLessonSchema = z.object({
  lessonId: z.string().min(1),
})

// --- Admin Schemas ---

export const ToggleUserSchema = z.object({
  userId: z.string().min(1),
})

export const ChangeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
})

export const RejectCourseSchema = z.object({
  courseId: z.string().min(1),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
})

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>
export type CreateChapterInput = z.infer<typeof CreateChapterSchema>
export type UpdateChapterInput = z.infer<typeof UpdateChapterSchema>
export type DeleteChapterInput = z.infer<typeof DeleteChapterSchema>
export type CreateLessonInput = z.infer<typeof CreateLessonSchema>
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>
export type DeleteLessonInput = z.infer<typeof DeleteLessonSchema>
export type ToggleUserInput = z.infer<typeof ToggleUserSchema>
export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>
export type RejectCourseInput = z.infer<typeof RejectCourseSchema>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/schemas.ts
git commit -m "feat(schemas): add course builder and admin validation schemas"
```

---

## Task 2: Course Builder Server Actions

**Files:**
- Modify: `lib/actions/course.ts`

- [ ] **Step 1: Extend course.ts with CRUD actions and helper**

Read `lib/actions/course.ts` first. It currently has `publishCourse`, `archiveCourse`, `deleteCourse`. Add the following functions and helper. The file should have all these imports at top:

```typescript
"use server"

import crypto from "crypto"
import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"
import {
  CourseStatusSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateChapterSchema,
  UpdateChapterSchema,
  DeleteChapterSchema,
  CreateLessonSchema,
  UpdateLessonSchema,
  DeleteLessonSchema,
} from "./schemas"
import type {
  CourseStatusInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateChapterInput,
  UpdateChapterInput,
  DeleteChapterInput,
  CreateLessonInput,
  UpdateLessonInput,
  DeleteLessonInput,
} from "./schemas"
```

Add the `ActionResult` type, `generateSlug` helper, `recalculateCourseCounts` helper, and `verifyCourseOwnership` (already exists — keep it). Then add these functions BEFORE the existing `publishCourse`:

```typescript
type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string }

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const suffix = crypto.randomUUID().slice(0, 6)
  return `${base}-${suffix}`
}

async function recalculateCourseCounts(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  courseId: string
) {
  const lessons = await tx.lesson.findMany({
    where: { chapter: { courseId, deletedAt: null }, deletedAt: null },
    select: { duration: true },
  })
  await tx.course.update({
    where: { id: courseId },
    data: {
      totalLessons: lessons.length,
      totalDuration: lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0),
    },
  })
}

export async function createCourse(data: CreateCourseInput): Promise<ActionResult> {
  const parsed = CreateCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { title, description, shortDesc, price, level, categoryId, thumbnailUrl } = parsed.data

  const slug = generateSlug(title)

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description,
      shortDesc,
      thumbnailUrl,
      price,
      isFree: price === 0,
      level,
      categoryId,
      instructorId: user.id,
      status: "DRAFT",
    },
  })

  return { success: true, id: course.id }
}

export async function updateCourse(data: UpdateCourseInput): Promise<ActionResult> {
  const parsed = UpdateCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId, ...fields } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  const updateData: Record<string, unknown> = { ...fields }
  if (fields.title) {
    updateData.slug = generateSlug(fields.title)
  }
  if (fields.price !== undefined) {
    updateData.isFree = fields.price === 0
  }

  await prisma.course.update({
    where: { id: courseId },
    data: updateData,
  })

  return { success: true }
}

export async function createChapter(data: CreateChapterInput): Promise<ActionResult> {
  const parsed = CreateChapterSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId, title, description } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  const maxPosition = await prisma.chapter.aggregate({
    where: { courseId, deletedAt: null },
    _max: { position: true },
  })

  const chapter = await prisma.chapter.create({
    data: {
      courseId,
      title,
      description: description ?? null,
      position: (maxPosition._max.position ?? 0) + 1,
    },
  })

  return { success: true, id: chapter.id }
}

export async function updateChapter(data: UpdateChapterInput): Promise<ActionResult> {
  const parsed = UpdateChapterSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { chapterId, ...fields } = parsed.data

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, deletedAt: null },
    select: { course: { select: { instructorId: true } } },
  })
  if (!chapter || (chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Chapter not found or you don't own it" }
  }

  await prisma.chapter.update({ where: { id: chapterId }, data: fields })
  return { success: true }
}

export async function deleteChapter(data: DeleteChapterInput): Promise<ActionResult> {
  const parsed = DeleteChapterSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { chapterId } = parsed.data

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, deletedAt: null },
    select: { courseId: true, course: { select: { instructorId: true } } },
  })
  if (!chapter || (chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Chapter not found or you don't own it" }
  }

  await prisma.$transaction(async (tx) => {
    const now = new Date()
    await tx.lesson.updateMany({ where: { chapterId, deletedAt: null }, data: { deletedAt: now } })
    await tx.chapter.update({ where: { id: chapterId }, data: { deletedAt: now } })
    await recalculateCourseCounts(tx, chapter.courseId)
  })

  return { success: true }
}

export async function createLesson(data: CreateLessonInput): Promise<ActionResult> {
  const parsed = CreateLessonSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { chapterId, title, type, content, videoUrl, duration } = parsed.data

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, deletedAt: null },
    select: { courseId: true, course: { select: { instructorId: true } } },
  })
  if (!chapter || (chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Chapter not found or you don't own it" }
  }

  const maxPosition = await prisma.lesson.aggregate({
    where: { chapterId, deletedAt: null },
    _max: { position: true },
  })

  await prisma.$transaction(async (tx) => {
    await tx.lesson.create({
      data: {
        chapterId,
        title,
        type,
        content: content ?? null,
        videoUrl: videoUrl ?? null,
        duration: duration ?? null,
        position: (maxPosition._max.position ?? 0) + 1,
      },
    })
    await recalculateCourseCounts(tx, chapter.courseId)
  })

  return { success: true }
}

export async function updateLesson(data: UpdateLessonInput): Promise<ActionResult> {
  const parsed = UpdateLessonSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { lessonId, ...fields } = parsed.data

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, deletedAt: null },
    select: { chapter: { select: { courseId: true, course: { select: { instructorId: true } } } } },
  })
  if (!lesson || (lesson.chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Lesson not found or you don't own it" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.lesson.update({ where: { id: lessonId }, data: fields })
    await recalculateCourseCounts(tx, lesson.chapter.courseId)
  })

  return { success: true }
}

export async function deleteLesson(data: DeleteLessonInput): Promise<ActionResult> {
  const parsed = DeleteLessonSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { lessonId } = parsed.data

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, deletedAt: null },
    select: { chapter: { select: { courseId: true, course: { select: { instructorId: true } } } } },
  })
  if (!lesson || (lesson.chapter.course.instructorId !== user.id && user.role !== "ADMIN")) {
    return { success: false, error: "Lesson not found or you don't own it" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.lesson.update({ where: { id: lessonId }, data: { deletedAt: new Date() } })
    await recalculateCourseCounts(tx, lesson.chapter.courseId)
  })

  return { success: true }
}
```

Keep the existing `verifyCourseOwnership`, `publishCourse`, `archiveCourse`, `deleteCourse` functions below.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/course.ts
git commit -m "feat(actions): add course builder CRUD — create, update, chapter, lesson management"
```

---

## Task 3: Admin Server Actions + Queries

**Files:**
- Create: `lib/actions/admin.ts`
- Create: `lib/queries/admin.ts`
- Modify: `lib/queries/index.ts`

- [ ] **Step 1: Create admin server actions**

```typescript
// lib/actions/admin.ts
"use server"

import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth/guards"
import { ToggleUserSchema, ChangeRoleSchema, CourseStatusSchema, RejectCourseSchema } from "./schemas"
import type { ToggleUserInput, ChangeRoleInput, CourseStatusInput, RejectCourseInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function toggleUserActive(data: ToggleUserInput): Promise<ActionResult> {
  const parsed = ToggleUserSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const admin = await requireRole(["ADMIN"])
  const { userId } = parsed.data

  if (userId === admin.id) {
    return { success: false, error: "You cannot ban yourself" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    })
    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: user.isActive ? "USER_BANNED" : "USER_UNBANNED",
        metadata: { targetUserId: userId, targetEmail: user.email },
      },
    })
  })

  return { success: true }
}

export async function changeUserRole(data: ChangeRoleInput): Promise<ActionResult> {
  const parsed = ChangeRoleSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const admin = await requireRole(["ADMIN"])
  const { userId, role } = parsed.data

  if (userId === admin.id) {
    return { success: false, error: "You cannot change your own role" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role },
    })
    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: "ROLE_CHANGE",
        metadata: { targetUserId: userId, oldRole: user.role, newRole: role },
      },
    })
  })

  return { success: true }
}

export async function approveCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { courseId } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { instructorId: true, title: true },
  })
  if (!course) return { success: false, error: "Course not found" }

  await prisma.$transaction(async (tx) => {
    await tx.course.update({
      where: { id: courseId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })
    await tx.notification.create({
      data: {
        userId: course.instructorId,
        type: "COURSE_APPROVED",
        title: "Course approved!",
        message: `Your course "${course.title}" has been approved and published.`,
        metadata: { courseId },
      },
    })
  })

  return { success: true }
}

export async function rejectCourse(data: RejectCourseInput): Promise<ActionResult> {
  const parsed = RejectCourseSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await requireRole(["ADMIN"])
  const { courseId, reason } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { instructorId: true, title: true },
  })
  if (!course) return { success: false, error: "Course not found" }

  await prisma.$transaction(async (tx) => {
    await tx.course.update({
      where: { id: courseId },
      data: { status: "DRAFT" },
    })
    await tx.notification.create({
      data: {
        userId: course.instructorId,
        type: "COURSE_REJECTED",
        title: "Course needs revision",
        message: `Your course "${course.title}" was not approved. Reason: ${reason}`,
        metadata: { courseId, reason },
      },
    })
  })

  return { success: true }
}
```

- [ ] **Step 2: Create admin queries**

```typescript
// lib/queries/admin.ts
import { prisma } from "@/lib/db"

/** Get all users for admin management */
export async function getAllUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

/** Get all courses for admin review */
export async function getAllCoursesAdmin() {
  return prisma.course.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      status: true,
      level: true,
      price: true,
      enrollmentCount: true,
      createdAt: true,
      instructor: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
```

- [ ] **Step 3: Update barrel exports**

In `lib/queries/index.ts`, add:
```typescript
export { getAllUsers, getAllCoursesAdmin } from "./admin"
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add lib/actions/admin.ts lib/queries/admin.ts lib/queries/index.ts
git commit -m "feat(admin): add admin server actions and queries for users + course approval"
```

---

## Task 4: Sidebar Navigation Updates

**Files:**
- Modify: `components/dashboard/SidebarNav.tsx`

- [ ] **Step 1: Add admin links and fix role handling**

Replace the entire content of `components/dashboard/SidebarNav.tsx`:

```typescript
"use client"

import Link from "next/link"

interface SidebarNavProps {
  role: "STUDENT" | "TEACHER" | "ADMIN"
  activePath: string
}

interface NavItem {
  label: string
  icon: string
  href: string
}

const studentLinks: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "My Courses", icon: "school", href: "/dashboard/courses" },
  { label: "Certificates", icon: "workspace_premium", href: "/dashboard/certificates" },
  { label: "Notifications", icon: "notifications", href: "/dashboard/notifications" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

const instructorLinks: NavItem[] = [
  { label: "Overview", icon: "dashboard", href: "/dashboard/instructor" },
  { label: "My Courses", icon: "edit_note", href: "/dashboard/instructor/courses" },
  { label: "Students", icon: "group", href: "/dashboard/instructor/students" },
  { label: "Revenue", icon: "payments", href: "/dashboard/instructor/revenue" },
  { label: "Reviews", icon: "rate_review", href: "/dashboard/instructor/reviews" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

const adminLinks: NavItem[] = [
  { label: "Overview", icon: "dashboard", href: "/dashboard/instructor" },
  { label: "Users", icon: "manage_accounts", href: "/dashboard/admin/users" },
  { label: "Courses", icon: "menu_book", href: "/dashboard/admin/courses" },
  { label: "My Courses", icon: "edit_note", href: "/dashboard/instructor/courses" },
  { label: "Revenue", icon: "payments", href: "/dashboard/instructor/revenue" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
]

export function SidebarNav({ role, activePath }: SidebarNavProps) {
  const links = role === "ADMIN" ? adminLinks : role === "TEACHER" ? instructorLinks : studentLinks

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {links.map((item) => {
        const isActive = activePath === item.href || activePath.startsWith(item.href + "/")

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-surface-container-high border-l-2 border-primary text-on-surface"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined !text-xl">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default SidebarNav
```

Note: Changed `isActive` check to also match child routes via `startsWith`.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/SidebarNav.tsx
git commit -m "feat(sidebar): add admin and instructor course navigation links"
```

---

## Task 5: Instructor Course List + Create Course Page

**Files:**
- Create: `app/(dashboard)/dashboard/instructor/courses/page.tsx`
- Create: `app/(dashboard)/dashboard/instructor/courses/new/page.tsx`

- [ ] **Step 1: Create instructor courses list page**

Create directories first, then the file:

```typescript
// app/(dashboard)/dashboard/instructor/courses/page.tsx
import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { getCurrentUser } from "@/lib/auth/actions"
import { getInstructorStats } from "@/lib/queries"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { formatPrice } from "@/lib/utils"

export default async function InstructorCoursesPage() {
  await requireRole(["TEACHER", "ADMIN"])
  const user = await getCurrentUser()
  if (!user) return null

  const stats = await getInstructorStats(user.id)
  const courses = stats.coursePerformance

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">My Courses</h2>
        <Link
          href="/dashboard/instructor/courses/new"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined !text-sm">add</span>
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">menu_book</span>
          <p className="text-sm">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Link
              key={course.courseId}
              href={`/dashboard/instructor/courses/${course.courseId}`}
              className="bg-surface-container border border-outline-variant rounded-xl p-5 flex items-center gap-5 hover:border-primary/50 transition-all group"
            >
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-outline !text-2xl">menu_book</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">{course.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-on-surface-variant">
                  <span>{course.studentCount} students</span>
                  <span>·</span>
                  <span>{course.rating > 0 ? `${course.rating.toFixed(1)} rating` : "No ratings"}</span>
                  <span>·</span>
                  <span>{formatPrice(course.revenue)}</span>
                </div>
              </div>
              <CourseBadge
                label={course.status === "PUBLISHED" ? "Published" : course.status === "DRAFT" ? "Draft" : course.status === "ARCHIVED" ? "Archived" : "Pending"}
                variant="status"
                status={course.status}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create new course page**

```typescript
// app/(dashboard)/dashboard/instructor/courses/new/page.tsx
import { requireRole } from "@/lib/auth/guards"
import { getCategories } from "@/lib/queries"
import { CreateCourseForm } from "./create-form"

export default async function NewCoursePage() {
  await requireRole(["TEACHER", "ADMIN"])
  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight">Create New Course</h2>
      <CreateCourseForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  )
}
```

- [ ] **Step 3: Create the client form component**

```typescript
// app/(dashboard)/dashboard/instructor/courses/new/create-form.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCourse } from "@/lib/actions/course"

interface CreateCourseFormProps {
  categories: { id: string; name: string }[]
}

export function CreateCourseForm({ categories }: CreateCourseFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const fd = new FormData(e.currentTarget)
    const data = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      shortDesc: fd.get("shortDesc") as string,
      price: Number(fd.get("price") || 0),
      level: fd.get("level") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      categoryId: fd.get("categoryId") as string,
      thumbnailUrl: (fd.get("thumbnailUrl") as string) || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    }

    startTransition(async () => {
      const result = await createCourse(data)
      if (result.success && result.id) {
        router.push(`/dashboard/instructor/courses/${result.id}`)
      } else if (!result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-5">
      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">{error}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-on-surface">Course Title</label>
        <input id="title" name="title" required minLength={3} maxLength={200} placeholder="e.g. Full-Stack Next.js Masterclass"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
      </div>

      <div className="space-y-2">
        <label htmlFor="shortDesc" className="text-sm font-medium text-on-surface">Short Description</label>
        <input id="shortDesc" name="shortDesc" required minLength={10} maxLength={500} placeholder="Brief summary shown on course cards"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-on-surface">Full Description</label>
        <textarea id="description" name="description" required minLength={10} maxLength={5000} rows={5} placeholder="Detailed course description..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-on-surface">Price (IDR)</label>
          <input id="price" name="price" type="number" min={0} step={1000} defaultValue={0} placeholder="0 = Free"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
        </div>
        <div className="space-y-2">
          <label htmlFor="level" className="text-sm font-medium text-on-surface">Level</label>
          <select id="level" name="level" defaultValue="BEGINNER"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryId" className="text-sm font-medium text-on-surface">Category</label>
        <select id="categoryId" name="categoryId" required
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
          <option value="">Select category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="thumbnailUrl" className="text-sm font-medium text-on-surface">Thumbnail URL</label>
        <input id="thumbnailUrl" name="thumbnailUrl" type="url" placeholder="https://images.unsplash.com/..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
      </div>

      <button type="submit" disabled={isPending}
        className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {isPending ? "Creating..." : "Create Course"}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/dashboard/instructor/courses/"
git commit -m "feat(builder): add instructor course list and create course pages"
```

---

## Task 6: Course Edit Page (Chapters + Lessons Management)

**Files:**
- Create: `app/(dashboard)/dashboard/instructor/courses/[courseId]/page.tsx`
- Create: `app/(dashboard)/dashboard/instructor/courses/[courseId]/edit-client.tsx`

This is the largest task — the course editor with chapter/lesson management. The server page fetches data, the client component handles all interactions.

- [ ] **Step 1: Create server component page**

```typescript
// app/(dashboard)/dashboard/instructor/courses/[courseId]/page.tsx
import { notFound } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"
import { getCurrentUser } from "@/lib/auth/actions"
import { getCategories } from "@/lib/queries"
import { prisma } from "@/lib/db"
import { CourseEditor } from "./edit-client"

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  await requireRole(["TEACHER", "ADMIN"])
  const user = await getCurrentUser()
  if (!user) return null

  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    include: {
      chapters: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { deletedAt: null },
            orderBy: { position: "asc" },
          },
        },
      },
      category: { select: { id: true, name: true } },
    },
  })

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    notFound()
  }

  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CourseEditor
        course={{
          id: course.id,
          title: course.title,
          description: course.description,
          shortDesc: course.shortDesc,
          price: Number(course.price),
          level: course.level,
          status: course.status,
          categoryId: course.categoryId,
          thumbnailUrl: course.thumbnailUrl,
          totalLessons: course.totalLessons,
          totalDuration: course.totalDuration,
          chapters: course.chapters.map((ch) => ({
            id: ch.id,
            title: ch.title,
            description: ch.description,
            position: ch.position,
            lessons: ch.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              type: l.type,
              duration: l.duration,
              position: l.position,
            })),
          })),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create client editor component**

```typescript
// app/(dashboard)/dashboard/instructor/courses/[courseId]/edit-client.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  updateCourse,
  createChapter,
  deleteChapter,
  createLesson,
  deleteLesson,
  publishCourse,
  archiveCourse,
} from "@/lib/actions/course"
import { CourseBadge } from "@/components/shared/CourseBadge"

interface CourseData {
  id: string
  title: string
  description: string
  shortDesc: string
  price: number
  level: string
  status: string
  categoryId: string
  thumbnailUrl: string
  totalLessons: number
  totalDuration: number
  chapters: {
    id: string
    title: string
    description: string | null
    position: number
    lessons: {
      id: string
      title: string
      type: string
      duration: number | null
      position: number
    }[]
  }[]
}

interface CourseEditorProps {
  course: CourseData
  categories: { id: string; name: string }[]
}

export function CourseEditor({ course, categories }: CourseEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Chapter form
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [chapterTitle, setChapterTitle] = useState("")

  // Lesson form
  const [addingLessonChapterId, setAddingLessonChapterId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonType, setLessonType] = useState<"VIDEO" | "TEXT" | "QUIZ">("VIDEO")

  function handleUpdateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setMessage("")
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateCourse({
        courseId: course.id,
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        shortDesc: fd.get("shortDesc") as string,
        price: Number(fd.get("price") || 0),
        level: fd.get("level") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        categoryId: fd.get("categoryId") as string,
        thumbnailUrl: fd.get("thumbnailUrl") as string,
      })
      if (result.success) {
        setMessage("Course updated!")
        router.refresh()
      } else setError(result.error)
    })
  }

  function handleAddChapter() {
    if (!chapterTitle.trim()) return
    startTransition(async () => {
      const result = await createChapter({ courseId: course.id, title: chapterTitle })
      if (result.success) {
        setChapterTitle("")
        setShowChapterForm(false)
        router.refresh()
      } else setError(result.error)
    })
  }

  function handleDeleteChapter(chapterId: string) {
    startTransition(async () => {
      const result = await deleteChapter({ chapterId })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  function handleAddLesson(chapterId: string) {
    if (!lessonTitle.trim()) return
    startTransition(async () => {
      const result = await createLesson({ chapterId, title: lessonTitle, type: lessonType })
      if (result.success) {
        setLessonTitle("")
        setAddingLessonChapterId(null)
        router.refresh()
      } else setError(result.error)
    })
  }

  function handleDeleteLesson(lessonId: string) {
    startTransition(async () => {
      const result = await deleteLesson({ lessonId })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishCourse({ courseId: course.id })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveCourse({ courseId: course.id })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  const lessonTypeIcons: Record<string, string> = {
    VIDEO: "play_circle",
    TEXT: "article",
    QUIZ: "quiz",
    ATTACHMENT: "attach_file",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/instructor/courses" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight">Edit Course</h2>
          <CourseBadge label={course.status} variant="status" status={course.status} />
        </div>
        <div className="flex gap-2">
          {course.status !== "PUBLISHED" && (
            <button onClick={handlePublish} disabled={isPending}
              className="bg-tertiary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
              Publish
            </button>
          )}
          {course.status === "PUBLISHED" && (
            <button onClick={handleArchive} disabled={isPending}
              className="border border-outline-variant bg-surface-container-low text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-container transition-all disabled:opacity-50">
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">{error}</div>}
      {message && <div className="bg-tertiary-container border border-tertiary/30 rounded-lg px-4 py-3 text-on-tertiary-container text-sm">{message}</div>}

      {/* Course Info Form */}
      <form onSubmit={handleUpdateCourse} className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-5">
        <h3 className="font-bold text-lg">Course Information</h3>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-on-surface">Title</label>
          <input id="title" name="title" defaultValue={course.title} required minLength={3}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
        </div>

        <div className="space-y-2">
          <label htmlFor="shortDesc" className="text-sm font-medium text-on-surface">Short Description</label>
          <input id="shortDesc" name="shortDesc" defaultValue={course.shortDesc} required
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-on-surface">Description</label>
          <textarea id="description" name="description" defaultValue={course.description} required rows={4}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background resize-none" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-on-surface">Price (IDR)</label>
            <input id="price" name="price" type="number" min={0} step={1000} defaultValue={course.price}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
          </div>
          <div className="space-y-2">
            <label htmlFor="level" className="text-sm font-medium text-on-surface">Level</label>
            <select id="level" name="level" defaultValue={course.level}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="categoryId" className="text-sm font-medium text-on-surface">Category</label>
            <select id="categoryId" name="categoryId" defaultValue={course.categoryId}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="thumbnailUrl" className="text-sm font-medium text-on-surface">Thumbnail URL</label>
          <input id="thumbnailUrl" name="thumbnailUrl" defaultValue={course.thumbnailUrl}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
        </div>

        <button type="submit" disabled={isPending}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Chapters & Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Curriculum</h3>
          <div className="text-sm text-on-surface-variant">{course.totalLessons} lessons · {Math.round(course.totalDuration / 60)} min</div>
        </div>

        {course.chapters.map((chapter) => (
          <div key={chapter.id} className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
            {/* Chapter header */}
            <div className="flex items-center justify-between px-5 py-4 bg-surface-container-high/50">
              <div>
                <h4 className="font-bold text-sm">{chapter.title}</h4>
                {chapter.description && <p className="text-xs text-on-surface-variant mt-0.5">{chapter.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">{chapter.lessons.length} lessons</span>
                <button onClick={() => handleDeleteChapter(chapter.id)} disabled={isPending}
                  className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined !text-lg">delete</span>
                </button>
              </div>
            </div>

            {/* Lessons */}
            <div className="divide-y divide-outline-variant">
              {chapter.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined !text-lg text-on-surface-variant">{lessonTypeIcons[lesson.type] ?? "article"}</span>
                    <span className="text-sm">{lesson.title}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase">{lesson.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.duration && <span className="text-xs text-on-surface-variant">{Math.round(lesson.duration / 60)}m</span>}
                    <button onClick={() => handleDeleteLesson(lesson.id)} disabled={isPending}
                      className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50">
                      <span className="material-symbols-outlined !text-base">close</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add lesson form */}
              {addingLessonChapterId === chapter.id ? (
                <div className="px-5 py-3 flex items-center gap-2">
                  <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Lesson title"
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                  <select value={lessonType} onChange={(e) => setLessonType(e.target.value as "VIDEO" | "TEXT" | "QUIZ")}
                    className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface">
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                  <button onClick={() => handleAddLesson(chapter.id)} disabled={isPending}
                    className="bg-primary text-on-primary px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50">Add</button>
                  <button onClick={() => setAddingLessonChapterId(null)}
                    className="text-on-surface-variant hover:text-on-surface px-2 py-2">
                    <span className="material-symbols-outlined !text-base">close</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => { setAddingLessonChapterId(chapter.id); setLessonTitle("") }}
                  className="w-full px-5 py-3 text-left text-sm text-primary hover:bg-surface-container-high/30 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base">add</span>
                  Add Lesson
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add chapter */}
        {showChapterForm ? (
          <div className="flex items-center gap-2">
            <input value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Chapter title"
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={handleAddChapter} disabled={isPending}
              className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold disabled:opacity-50">Add</button>
            <button onClick={() => setShowChapterForm(false)}
              className="text-on-surface-variant hover:text-on-surface px-3 py-3">Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setShowChapterForm(true); setChapterTitle("") }}
            className="w-full border border-dashed border-outline-variant rounded-xl py-4 text-sm text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined !text-lg">add</span>
            Add Chapter
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/dashboard/instructor/courses/[courseId]/"
git commit -m "feat(builder): add course editor with chapter and lesson management"
```

---

## Task 7: Admin Pages (Users + Courses)

**Files:**
- Create: `app/(dashboard)/dashboard/admin/page.tsx`
- Create: `app/(dashboard)/dashboard/admin/users/page.tsx`
- Create: `app/(dashboard)/dashboard/admin/users/users-client.tsx`
- Create: `app/(dashboard)/dashboard/admin/courses/page.tsx`
- Create: `app/(dashboard)/dashboard/admin/courses/courses-client.tsx`

- [ ] **Step 1: Create admin redirect page**

```typescript
// app/(dashboard)/dashboard/admin/page.tsx
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"

export default async function AdminPage() {
  await requireRole(["ADMIN"])
  redirect("/dashboard/admin/users")
}
```

- [ ] **Step 2: Create admin users server page**

```typescript
// app/(dashboard)/dashboard/admin/users/page.tsx
import { requireRole } from "@/lib/auth/guards"
import { getAllUsers } from "@/lib/queries"
import { UsersTable } from "./users-client"

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"])
  const users = await getAllUsers()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight">User Management</h2>
      <UsersTable users={users.map((u) => ({
        id: u.id,
        name: u.name ?? "No name",
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
      }))} />
    </div>
  )
}
```

- [ ] **Step 3: Create users client component**

```typescript
// app/(dashboard)/dashboard/admin/users/users-client.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/shared/Avatar"
import { toggleUserActive, changeUserRole } from "@/lib/actions/admin"
import { formatRelativeTime } from "@/lib/utils"

interface UserRow {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: "STUDENT" | "TEACHER" | "ADMIN"
  isActive: boolean
  createdAt: string
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleToggleActive(userId: string) {
    startTransition(async () => {
      await toggleUserActive({ userId })
      router.refresh()
    })
  }

  function handleRoleChange(userId: string, role: "STUDENT" | "TEACHER" | "ADMIN") {
    startTransition(async () => {
      await changeUserRole({ userId, role })
      router.refresh()
    })
  }

  const roleBadgeColor: Record<string, string> = {
    ADMIN: "bg-error-container text-on-error-container",
    TEACHER: "bg-primary/20 text-primary",
    STUDENT: "bg-surface-container-highest text-on-surface-variant",
  }

  return (
    <div className="space-y-4">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-surface-variant/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-on-surface-variant">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as "STUDENT" | "TEACHER" | "ADMIN")}
                    disabled={isPending}
                    className="bg-surface-container-low border border-outline-variant rounded px-2 py-1 text-xs font-bold disabled:opacity-50">
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.isActive ? "bg-tertiary-container text-tertiary" : "bg-error-container text-on-error-container"}`}>
                    {user.isActive ? "Active" : "Banned"}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-on-surface-variant">{formatRelativeTime(user.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleToggleActive(user.id)} disabled={isPending}
                    className={`text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${
                      user.isActive ? "text-error hover:bg-error-container" : "text-tertiary hover:bg-tertiary-container"
                    }`}>
                    {user.isActive ? "Ban" : "Unban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create admin courses server page**

```typescript
// app/(dashboard)/dashboard/admin/courses/page.tsx
import { requireRole } from "@/lib/auth/guards"
import { getAllCoursesAdmin } from "@/lib/queries"
import { AdminCoursesTable } from "./courses-client"

export default async function AdminCoursesPage() {
  await requireRole(["ADMIN"])
  const courses = await getAllCoursesAdmin()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight">Course Management</h2>
      <AdminCoursesTable courses={courses.map((c) => ({
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        status: c.status,
        level: c.level,
        price: Number(c.price),
        enrollmentCount: c.enrollmentCount,
        createdAt: c.createdAt.toISOString(),
        instructorName: c.instructor.name ?? "Unknown",
      }))} />
    </div>
  )
}
```

- [ ] **Step 5: Create admin courses client component**

```typescript
// app/(dashboard)/dashboard/admin/courses/courses-client.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { approveCourse, rejectCourse } from "@/lib/actions/admin"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { formatPrice, formatRelativeTime } from "@/lib/utils"

interface CourseRow {
  id: string
  title: string
  thumbnailUrl: string
  status: string
  level: string
  price: number
  enrollmentCount: number
  createdAt: string
  instructorName: string
}

type StatusFilter = "ALL" | "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED"

export function AdminCoursesTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<StatusFilter>("ALL")
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const filtered = filter === "ALL" ? courses : courses.filter((c) => c.status === filter)

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Draft", value: "DRAFT" },
    { label: "Pending", value: "PENDING_REVIEW" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Archived", value: "ARCHIVED" },
  ]

  function handleApprove(courseId: string) {
    startTransition(async () => {
      await approveCourse({ courseId })
      router.refresh()
    })
  }

  function handleReject(courseId: string) {
    if (rejectReason.length < 5) return
    startTransition(async () => {
      await rejectCourse({ courseId, reason: rejectReason })
      setRejectingId(null)
      setRejectReason("")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {statusFilters.map((sf) => (
          <button key={sf.value} onClick={() => setFilter(sf.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === sf.value ? "bg-primary text-on-primary" : "bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}>
            {sf.label}
          </button>
        ))}
      </div>

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
              <th className="px-5 py-3 font-semibold">Course</th>
              <th className="px-5 py-3 font-semibold">Instructor</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Students</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-surface-variant/30 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-sm font-medium line-clamp-1">{course.title}</span>
                </td>
                <td className="px-5 py-3 text-sm text-on-surface-variant">{course.instructorName}</td>
                <td className="px-5 py-3">
                  <CourseBadge label={course.status === "PUBLISHED" ? "Published" : course.status === "DRAFT" ? "Draft" : course.status === "PENDING_REVIEW" ? "Pending" : "Archived"} variant="status" status={course.status} />
                </td>
                <td className="px-5 py-3 text-sm">{course.enrollmentCount}</td>
                <td className="px-5 py-3 text-sm">{formatPrice(course.price)}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {course.status !== "PUBLISHED" && (
                      <button onClick={() => handleApprove(course.id)} disabled={isPending}
                        className="text-xs font-bold text-tertiary hover:bg-tertiary-container px-3 py-1.5 rounded transition-colors disabled:opacity-50">
                        Approve
                      </button>
                    )}
                    {rejectingId === course.id ? (
                      <div className="flex items-center gap-1">
                        <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (min 5 chars)"
                          className="bg-surface-container-low border border-outline-variant rounded px-2 py-1 text-xs w-40" />
                        <button onClick={() => handleReject(course.id)} disabled={isPending || rejectReason.length < 5}
                          className="text-xs font-bold text-error px-2 py-1 disabled:opacity-50">Send</button>
                        <button onClick={() => setRejectingId(null)} className="text-xs text-on-surface-variant px-1">×</button>
                      </div>
                    ) : (
                      course.status !== "DRAFT" && (
                        <button onClick={() => setRejectingId(course.id)} disabled={isPending}
                          className="text-xs font-bold text-error hover:bg-error-container px-3 py-1.5 rounded transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/dashboard/admin/"
git commit -m "feat(admin): add user management and course approval pages"
```

---

## Task 8: Quiz UI in Player

**Files:**
- Modify: `lib/queries/lesson.ts`
- Modify: `lib/queries/index.ts`
- Modify: `app/(player)/learn/[courseId]/[lessonId]/page.tsx`
- Modify: `app/(player)/learn/[courseId]/[lessonId]/player-client.tsx`

- [ ] **Step 1: Add quiz query**

Append to `lib/queries/lesson.ts`:

```typescript
/** Get quiz for a lesson (strip isCorrect from options for client) */
export async function getQuizByLessonId(lessonId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: {
          options: {
            orderBy: { position: "asc" },
            select: { id: true, text: true, position: true },
          },
        },
      },
    },
  })
  if (!quiz) return null

  return {
    id: quiz.id,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      explanation: q.explanation,
      position: q.position,
      options: q.options,
    })),
  }
}
```

Update barrel exports in `lib/queries/index.ts` — add `getQuizByLessonId`:
```typescript
export { getLessonProgressByUser, getFirstLessonId, getLessonById, getQuizByLessonId } from "./lesson"
```

- [ ] **Step 2: Update player server component to pass quiz data**

In `app/(player)/learn/[courseId]/[lessonId]/page.tsx`, add import and pass quiz:

Add to imports:
```typescript
import { getCourseWithCurriculum, getLessonProgressByUser, getQuizByLessonId } from "@/lib/queries"
```

After the lesson finding logic, before the return statement:
```typescript
  // Get quiz if lesson type is QUIZ
  const quiz = lesson.type === "QUIZ" ? await getQuizByLessonId(lesson.id) : null
```

Update the return to pass quiz:
```tsx
    <VideoPlayerPage
      course={course}
      lesson={lesson}
      lessonProgress={lessonProgress}
      quiz={quiz}
    />
```

- [ ] **Step 3: Update player client component with quiz UI**

In `player-client.tsx`, update the interface and add quiz rendering.

Add import:
```typescript
import { submitQuizAttempt } from "@/lib/actions/quiz"
```

Update the type definition:
```typescript
interface QuizData {
  id: string
  title: string
  passingScore: number
  questions: {
    id: string
    text: string
    explanation: string | null
    position: number
    options: { id: string; text: string; position: number }[]
  }[]
}

interface VideoPlayerPageProps {
  course: CourseDetail
  lesson: Lesson
  lessonProgress: LessonProgress[]
  quiz?: QuizData | null
}
```

Update the component signature:
```typescript
export default function VideoPlayerPage({ course, lesson, lessonProgress, quiz }: VideoPlayerPageProps) {
```

Add quiz state after existing state:
```typescript
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [isSubmittingQuiz, startQuizSubmit] = useTransition()
```

Add quiz submit handler:
```typescript
  function handleSubmitQuiz() {
    if (!quiz) return
    const answers = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }))
    startQuizSubmit(async () => {
      const result = await submitQuizAttempt({ quizId: quiz.id, answers })
      if (result.success) {
        setQuizResult({ score: result.score, passed: result.passed })
        router.refresh()
      }
    })
  }
```

In the main content area where the video placeholder is rendered, wrap it with a condition. Find the video area (the large area with the play button icon) and add before it:

```tsx
{lesson.type === "QUIZ" && quiz ? (
  <div className="flex-1 overflow-y-auto p-8">
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{quiz.title}</h2>
      <p className="text-sm text-on-surface-variant">Passing score: {quiz.passingScore}%</p>

      {quizResult ? (
        <div className={`p-6 rounded-xl border ${quizResult.passed ? "bg-tertiary-container/20 border-tertiary/30" : "bg-error-container border-error/30"}`}>
          <h3 className="text-xl font-bold mb-2">{quizResult.passed ? "Passed!" : "Not Passed"}</h3>
          <p className="text-lg">Score: {quizResult.score}%</p>
          {!quizResult.passed && (
            <button onClick={() => { setQuizResult(null); setSelectedAnswers({}) }}
              className="mt-4 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm">
              Try Again
            </button>
          )}
        </div>
      ) : (
        <>
          {quiz.questions.map((q, qi) => (
            <div key={q.id} className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-3">
              <h4 className="font-bold">{qi + 1}. {q.text}</h4>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnswers[q.id] === opt.id ? "border-primary bg-primary/10" : "border-outline-variant hover:border-primary/50"
                  }`}>
                    <input type="radio" name={q.id} value={opt.id} checked={selectedAnswers[q.id] === opt.id}
                      onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                      className="accent-primary" />
                    <span className="text-sm">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmitQuiz}
            disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length < quiz.questions.length}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmittingQuiz ? "Submitting..." : "Submit Quiz"}
          </button>
        </>
      )}
    </div>
  </div>
) : (
```

Close the condition after the existing video content area with `)}`.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add lib/queries/lesson.ts lib/queries/index.ts "app/(player)/learn/[courseId]/[lessonId]/"
git commit -m "feat(quiz): add quiz UI in player with scoring and retry"
```

---

## Task 9: Certificate Print + Final Cleanup

**Files:**
- Modify: `app/certificate/[verifyCode]/page.tsx`
- Modify: `app/globals.css`
- Modify: `docs/learnify-prd.md`

- [ ] **Step 1: Add print button to certificate page**

In `app/certificate/[verifyCode]/page.tsx`, make it a client component wrapper for the print button. Simpler: just add a `PrintButton` inline.

Replace the "Download PDF" button (around line 94) with:

```tsx
<button
  onClick={() => window.print()}
  className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 transition-all print:hidden"
>
  <span className="material-symbols-outlined !text-lg">print</span>
  Print Certificate
</button>
```

Since this uses `onClick`, the page needs `"use client"` — but it's a server component with data fetching. Solution: extract just the button.

Actually, simpler: create a tiny client component:

```typescript
// app/certificate/[verifyCode]/print-button.tsx
"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 transition-all print:hidden"
    >
      <span className="material-symbols-outlined !text-lg">print</span>
      Print Certificate
    </button>
  )
}
```

Then in the certificate page, replace the Download PDF button with:
```tsx
import { PrintButton } from "./print-button"
// ... and in JSX:
<PrintButton />
```

- [ ] **Step 2: Add print CSS to globals.css**

Append to `app/globals.css`:

```css
/* Print styles for certificate page */
@media print {
  body {
    background-color: white !important;
    color: black !important;
  }
  .print\\:hidden {
    display: none !important;
  }
  nav, footer, header {
    display: none !important;
  }
}
```

- [ ] **Step 3: Update PRD phase status**

In `docs/learnify-prd.md`, change:
```markdown
**Current Phase:** Phase 3 — Backend Foundation
```
to:
```markdown
**Current Phase:** Phase 4 — Business Logic (Complete)
```

- [ ] **Step 4: Verify TypeScript compiles and lint passes**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Run: `pnpm lint 2>&1 | tail -5`

- [ ] **Step 5: Commit**

```bash
git add "app/certificate/" app/globals.css docs/learnify-prd.md
git commit -m "feat: add certificate print, update PRD to Phase 4 complete"
```
