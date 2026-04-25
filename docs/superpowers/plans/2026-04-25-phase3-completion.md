# Phase 3 Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 3 backend by implementing 5 server action modules, fixing 7 query/data issues, and removing all mock data remnants.

**Architecture:** Server actions in `lib/actions/` follow existing `lib/auth/actions.ts` pattern — `"use server"`, Zod validation, auth guards, `ActionResult` return type. Queries in `lib/queries/` use Prisma with serializers. All actions create `Notification` entries for activity feed.

**Tech Stack:** Next.js 16 (App Router), Prisma 7 + Neon PostgreSQL, Zod 4, TypeScript strict mode.

**Spec:** `docs/superpowers/specs/2026-04-25-phase3-completion-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `lib/actions/schemas.ts` | Zod validation schemas for all non-auth actions |
| `lib/actions/enrollment.ts` | `enrollInCourse` — free + fake paid enrollment |
| `lib/actions/progress.ts` | `markLessonComplete`, `updateWatchProgress` |
| `lib/actions/quiz.ts` | `submitQuizAttempt` — score + pass/fail |
| `lib/actions/review.ts` | `submitReview` — rating + comment |
| `lib/actions/course.ts` | `publishCourse`, `archiveCourse`, `deleteCourse` |

### Modified Files
| File | Changes |
|------|---------|
| `lib/queries/instructor.ts` | Add monthly revenue raw SQL aggregation |
| `lib/queries/course.ts` | Add `getPlatformStats()`, `getTopReviews()`, `getCourseWithCurriculum()` |
| `lib/queries/index.ts` | Export new query functions |
| `lib/serializers.ts:72` | Fix hardcoded `studentCount: 0` |
| `app/(marketing)/page.tsx` | Replace `MOCK_TESTIMONIALS` + hardcoded stats with real queries |
| `app/(dashboard)/dashboard/page.tsx` | Replace `MOCK_ACTIVITY` with notifications query |
| `app/(dashboard)/dashboard/instructor/page.tsx:35` | Remove hardcoded slug |
| `app/(player)/learn/[courseId]/[lessonId]/page.tsx:15` | Move direct Prisma call to query layer |
| `app/auth/login/page.tsx:78` | Fix dead "Forgot password?" link |
| `app/auth/register/page.tsx:160-162` | Fix dead Terms/Privacy links |

---

## Task 1: Validation Schemas

**Files:**
- Create: `lib/actions/schemas.ts`

- [ ] **Step 1: Create validation schemas file**

```typescript
// lib/actions/schemas.ts
import { z } from "zod/v4"

export const EnrollmentSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
})

export const LessonCompleteSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
})

export const WatchProgressSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  watchedSeconds: z.number().int().min(0),
})

export const QuizSubmitSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionId: z.string().min(1),
      })
    )
    .min(1, "At least one answer is required"),
})

export const ReviewSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
})

export const CourseStatusSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
})

export type EnrollmentInput = z.infer<typeof EnrollmentSchema>
export type LessonCompleteInput = z.infer<typeof LessonCompleteSchema>
export type WatchProgressInput = z.infer<typeof WatchProgressSchema>
export type QuizSubmitInput = z.infer<typeof QuizSubmitSchema>
export type ReviewInput = z.infer<typeof ReviewSchema>
export type CourseStatusInput = z.infer<typeof CourseStatusSchema>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `lib/actions/schemas.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/schemas.ts
git commit -m "feat(actions): add Zod validation schemas for Phase 3 server actions"
```

---

## Task 2: Enrollment Server Action

**Files:**
- Create: `lib/actions/enrollment.ts`

- [ ] **Step 1: Create enrollment action**

```typescript
// lib/actions/enrollment.ts
"use server"

import crypto from "crypto"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { EnrollmentSchema } from "./schemas"
import type { EnrollmentInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function enrollInCourse(data: EnrollmentInput): Promise<ActionResult> {
  const parsed = EnrollmentSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  if (user.role !== "STUDENT") {
    return { success: false, error: "Only students can enroll in courses" }
  }

  const { courseId } = parsed.data

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED", deletedAt: null },
    select: { id: true, instructorId: true, price: true, isFree: true, title: true },
  })

  if (!course) {
    return { success: false, error: "Course not found" }
  }

  if (course.instructorId === user.id) {
    return { success: false, error: "You cannot enroll in your own course" }
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (existing) {
    return { success: false, error: "You are already enrolled in this course" }
  }

  const price = Number(course.price)

  await prisma.$transaction(async (tx) => {
    // Create order for paid courses (demo payment)
    if (price > 0) {
      await tx.order.create({
        data: {
          userId: user.id,
          courseId,
          amount: course.price,
          status: "COMPLETED",
          paymentMethod: "demo",
          paymentId: `demo_${crypto.randomUUID()}`,
          paidAt: new Date(),
        },
      })
    }

    // Create enrollment
    await tx.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        progressPercent: 0,
      },
    })

    // Increment cached enrollment count
    await tx.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } },
    })

    // Create notification for student
    await tx.notification.create({
      data: {
        userId: user.id,
        type: "ENROLLMENT",
        title: "Enrolled successfully",
        message: `You have enrolled in "${course.title}"`,
        metadata: { courseId },
      },
    })
  })

  return { success: true }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `lib/actions/enrollment.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/enrollment.ts
git commit -m "feat(actions): add enrollment server action with free + demo paid flow"
```

---

## Task 3: Progress Server Actions

**Files:**
- Create: `lib/actions/progress.ts`

- [ ] **Step 1: Create progress actions**

```typescript
// lib/actions/progress.ts
"use server"

import crypto from "crypto"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { LessonCompleteSchema, WatchProgressSchema } from "./schemas"
import type { LessonCompleteInput, WatchProgressInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

async function verifyEnrollment(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { chapter: { select: { courseId: true } } },
  })
  if (!lesson) return null

  const courseId = lesson.chapter.courseId
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!enrollment) return null

  return { courseId, enrollmentId: enrollment.id }
}

export async function markLessonComplete(data: LessonCompleteInput): Promise<ActionResult> {
  const parsed = LessonCompleteSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { lessonId } = parsed.data

  const context = await verifyEnrollment(user.id, lessonId)
  if (!context) {
    return { success: false, error: "You are not enrolled in this course" }
  }

  const { courseId } = context

  await prisma.$transaction(async (tx) => {
    // Upsert lesson progress
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: {
        userId: user.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    // Recalculate progress percentage
    const allLessonIds = await tx.lesson.findMany({
      where: {
        chapter: { courseId, deletedAt: null },
        deletedAt: null,
      },
      select: { id: true },
    })
    const totalLessons = allLessonIds.length

    const completedLessons = await tx.lessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: allLessonIds.map((l) => l.id) },
        isCompleted: true,
      },
    })

    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    await tx.enrollment.update({
      where: { userId_courseId: { userId: user.id, courseId } },
      data: {
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
      },
    })

    // Auto-issue certificate on 100% completion
    if (progressPercent === 100) {
      const existingCert = await tx.certificate.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
      })

      if (!existingCert) {
        const course = await tx.course.findUnique({
          where: { id: courseId },
          select: { title: true },
        })

        await tx.certificate.create({
          data: {
            userId: user.id,
            courseId,
            verifyCode: crypto.randomUUID().slice(0, 12),
          },
        })

        await tx.notification.create({
          data: {
            userId: user.id,
            type: "CERTIFICATE_ISSUED",
            title: "Certificate earned!",
            message: `Congratulations! You completed "${course?.title}" and earned a certificate.`,
            metadata: { courseId },
          },
        })
      }
    }
  })

  return { success: true }
}

export async function updateWatchProgress(data: WatchProgressInput): Promise<ActionResult> {
  const parsed = WatchProgressSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { lessonId, watchedSeconds } = parsed.data

  const context = await verifyEnrollment(user.id, lessonId)
  if (!context) {
    return { success: false, error: "You are not enrolled in this course" }
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      watchedSeconds,
    },
    update: {
      watchedSeconds,
    },
  })

  return { success: true }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `lib/actions/progress.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/progress.ts
git commit -m "feat(actions): add lesson progress tracking with auto-certificate on completion"
```

---

## Task 4: Quiz Server Action

**Files:**
- Create: `lib/actions/quiz.ts`

- [ ] **Step 1: Create quiz action**

```typescript
// lib/actions/quiz.ts
"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { QuizSubmitSchema } from "./schemas"
import type { QuizSubmitInput } from "./schemas"
import { markLessonComplete } from "./progress"

type ActionResult =
  | { success: true; score: number; passed: boolean }
  | { success: false; error: string }

export async function submitQuizAttempt(data: QuizSubmitInput): Promise<ActionResult> {
  const parsed = QuizSubmitSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { quizId, answers } = parsed.data

  // Fetch quiz with questions and correct answers
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: {
        select: {
          id: true,
          chapter: { select: { courseId: true } },
        },
      },
      questions: {
        include: {
          options: { select: { id: true, isCorrect: true } },
        },
        orderBy: { position: "asc" },
      },
    },
  })

  if (!quiz) {
    return { success: false, error: "Quiz not found" }
  }

  // Verify enrollment
  const courseId = quiz.lesson.chapter.courseId
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (!enrollment) {
    return { success: false, error: "You are not enrolled in this course" }
  }

  // Score the quiz
  const totalQuestions = quiz.questions.length
  let correctCount = 0

  const answersMap: Record<string, string> = {}
  for (const answer of answers) {
    answersMap[answer.questionId] = answer.selectedOptionId
  }

  for (const question of quiz.questions) {
    const selectedOptionId = answersMap[question.id]
    if (!selectedOptionId) continue

    const correctOption = question.options.find((o) => o.isCorrect)
    if (correctOption && correctOption.id === selectedOptionId) {
      correctCount++
    }
  }

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const passed = score >= quiz.passingScore

  // Save attempt
  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      score,
      isPassed: passed,
      answers: answersMap,
      completedAt: new Date(),
    },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: passed ? "QUIZ_PASSED" : "QUIZ_FAILED",
      title: passed ? "Quiz passed!" : "Quiz not passed",
      message: passed
        ? `You scored ${score}% on "${quiz.title}". Well done!`
        : `You scored ${score}% on "${quiz.title}". ${quiz.passingScore}% required to pass.`,
      metadata: { quizId, courseId },
    },
  })

  // Mark lesson complete if passed
  if (passed) {
    await markLessonComplete({ lessonId: quiz.lesson.id })
  }

  return { success: true, score, passed }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `lib/actions/quiz.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/quiz.ts
git commit -m "feat(actions): add quiz submission with auto-scoring and pass/fail"
```

---

## Task 5: Review Server Action

**Files:**
- Create: `lib/actions/review.ts`

- [ ] **Step 1: Create review action**

```typescript
// lib/actions/review.ts
"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { ReviewSchema } from "./schemas"
import type { ReviewInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function submitReview(data: ReviewInput): Promise<ActionResult> {
  const parsed = ReviewSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { courseId, rating, comment } = parsed.data

  // Verify enrollment + completion
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (!enrollment) {
    return { success: false, error: "You must be enrolled in this course to review it" }
  }

  if (enrollment.progressPercent < 100) {
    return { success: false, error: "You must complete the course before leaving a review" }
  }

  // Check for duplicate review
  const existingReview = await prisma.review.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (existingReview) {
    return { success: false, error: "You have already reviewed this course" }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  })

  if (!course) {
    return { success: false, error: "Course not found" }
  }

  await prisma.$transaction(async (tx) => {
    // Create review
    await tx.review.create({
      data: {
        userId: user.id,
        courseId,
        rating,
        comment,
      },
    })

    // Recalculate course rating + review count
    const aggregation = await tx.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await tx.course.update({
      where: { id: courseId },
      data: {
        rating: aggregation._avg.rating ?? 0,
        reviewCount: aggregation._count.rating,
      },
    })

    // Notify instructor
    await tx.notification.create({
      data: {
        userId: course.instructorId,
        type: "NEW_REVIEW",
        title: "New course review",
        message: `${user.name ?? "A student"} left a ${rating}-star review on "${course.title}"`,
        metadata: { courseId },
      },
    })
  })

  return { success: true }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `lib/actions/review.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/review.ts
git commit -m "feat(actions): add review submission with course rating recalculation"
```

---

## Task 6: Course Status Server Actions

**Files:**
- Create: `lib/actions/course.ts`

- [ ] **Step 1: Create course status actions**

```typescript
// lib/actions/course.ts
"use server"

import { prisma } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth/guards"
import { CourseStatusSchema } from "./schemas"
import type { CourseStatusInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

async function verifyCourseOwnership(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    select: { id: true, instructorId: true, title: true },
  })

  if (!course) return null
  if (course.instructorId !== userId) return null
  return course
}

export async function publishCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  return { success: true }
}

export async function archiveCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "ARCHIVED" },
  })

  return { success: true }
}

export async function deleteCourse(data: CourseStatusInput): Promise<ActionResult> {
  const parsed = CourseStatusSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { courseId } = parsed.data

  const course = await verifyCourseOwnership(user.id, courseId)
  if (!course && user.role !== "ADMIN") {
    return { success: false, error: "Course not found or you don't own it" }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { deletedAt: new Date() },
  })

  return { success: true }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `lib/actions/course.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/actions/course.ts
git commit -m "feat(actions): add course publish, archive, and soft-delete actions"
```

---

## Task 7: Fix Monthly Revenue Query

**Files:**
- Modify: `lib/queries/instructor.ts:53`

- [ ] **Step 1: Add monthly revenue raw SQL query**

In `lib/queries/instructor.ts`, replace the line `monthlyRevenue: [] as { month: string; revenue: number }[]` with a real query. The full updated function:

Replace the entire `getInstructorStats` function body. After the existing `coursePerformance` calculation (line 44), before the `return` statement, add the monthly revenue query:

```typescript
// Replace: monthlyRevenue: [] as { month: string; revenue: number }[],
// With the following query before the return statement:

  const monthlyRevenueRows = await prisma.$queryRaw<
    { month: string; revenue: number }[]
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', o."createdAt"), 'YYYY-MM') AS month,
      SUM(o."amount")::float AS revenue
    FROM "orders" o
    JOIN "courses" c ON o."courseId" = c."id"
    WHERE c."instructorId" = ${instructorId}
      AND o."status" = 'COMPLETED'
      AND o."createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', o."createdAt")
    ORDER BY month ASC
  `
```

Then in the return object, replace `monthlyRevenue: []` with `monthlyRevenue: monthlyRevenueRows`.

The full updated file should be:

```typescript
import { prisma } from "@/lib/db"

/** Get instructor dashboard stats */
export async function getInstructorStats(instructorId: string) {
  const courses = await prisma.course.findMany({
    where: { instructorId, deletedAt: null },
    select: {
      id: true,
      title: true,
      thumbnailUrl: true,
      status: true,
      rating: true,
      reviewCount: true,
      enrollmentCount: true,
      price: true,
    },
  })

  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED")
  const totalStudents = courses.reduce((sum, c) => sum + c.enrollmentCount, 0)
  const avgRating =
    publishedCourses.length > 0
      ? publishedCourses.reduce((sum, c) => sum + c.rating, 0) / publishedCourses.length
      : 0

  // Calculate revenue from completed orders
  const revenueResult = await prisma.order.aggregate({
    where: { course: { instructorId }, status: "COMPLETED" },
    _sum: { amount: true },
  })
  const totalRevenue = revenueResult._sum.amount
    ? Number(revenueResult._sum.amount)
    : 0

  // Course performance data
  const coursePerformance = courses.map((c) => ({
    courseId: c.id,
    title: c.title,
    thumbnailUrl: c.thumbnailUrl,
    studentCount: c.enrollmentCount,
    rating: c.rating,
    revenue: Number(c.price) * c.enrollmentCount, // approximate
    status: c.status,
  }))

  // Monthly revenue aggregation (last 12 months)
  const monthlyRevenue = await prisma.$queryRaw<
    { month: string; revenue: number }[]
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', o."createdAt"), 'YYYY-MM') AS month,
      SUM(o."amount")::float AS revenue
    FROM "orders" o
    JOIN "courses" c ON o."courseId" = c."id"
    WHERE c."instructorId" = ${instructorId}
      AND o."status" = 'COMPLETED'
      AND o."createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', o."createdAt")
    ORDER BY month ASC
  `

  return {
    totalRevenue,
    totalRevenueChange: 0,
    totalStudents,
    totalStudentsChange: 0,
    activeCourses: publishedCourses.length,
    avgRating: Math.round(avgRating * 100) / 100,
    monthlyRevenue,
    coursePerformance,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/queries/instructor.ts
git commit -m "fix(queries): add real monthly revenue aggregation via raw SQL"
```

---

## Task 8: Add New Queries (Platform Stats, Top Reviews, Course by ID)

**Files:**
- Modify: `lib/queries/course.ts`
- Modify: `lib/queries/index.ts`

- [ ] **Step 1: Add new query functions to course.ts**

Append the following functions to `lib/queries/course.ts`:

```typescript
/** Get platform-wide stats for landing page */
export async function getPlatformStats() {
  const [totalStudents, totalCourses, ratingResult] = await Promise.all([
    prisma.enrollment.groupBy({
      by: ["userId"],
      _count: true,
    }).then((rows) => rows.length),
    prisma.course.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.course.aggregate({
      where: { status: "PUBLISHED", deletedAt: null, reviewCount: { gt: 0 } },
      _avg: { rating: true },
    }),
  ])

  return {
    totalStudents,
    totalCourses,
    avgRating: ratingResult._avg.rating
      ? Math.round(ratingResult._avg.rating * 10) / 10
      : 0,
  }
}

/** Get top reviews for testimonials section */
export async function getTopReviews(limit = 3) {
  const rows = await prisma.review.findMany({
    where: { rating: { gte: 4 } },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return rows.map((r) => ({
    id: r.id,
    quote: r.comment ?? "",
    authorName: r.user.name ?? "Student",
    authorRole: "Student",
    authorCompany: "Learnify",
    avatarUrl: r.user.avatarUrl ?? "",
    courseTitle: r.course.title,
    rating: r.rating,
  }))
}

/** Get course with full curriculum by ID (for player page) */
export async function getCourseWithCurriculum(courseId: string): Promise<CourseDetail | null> {
  const row = await prisma.course.findUnique({
    where: { id: courseId, deletedAt: null },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          _count: { select: { courses: true } },
        },
      },
      category: { select: { id: true, name: true, slug: true } },
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
      attachments: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  })
  if (!row) return null
  return serializeCourseDetail(row)
}
```

Note: `getCourseWithCurriculum` needs the existing imports `serializeCourseDetail` and `CourseDetail` which are already imported at the top of the file.

- [ ] **Step 2: Update barrel exports in index.ts**

Replace the content of `lib/queries/index.ts`:

```typescript
export { getPublishedCourses, getFeaturedCourses, getCourseBySlug, getPlatformStats, getTopReviews, getCourseWithCurriculum } from "./course"
export { getCategories } from "./category"
export { getEnrollmentsByUser, getRecentEnrollmentsByInstructor } from "./enrollment"
export { getStudentStats, getCertificatesByUser, getNotificationsByUser } from "./student"
export { getInstructorStats } from "./instructor"
export { getCertificateByCode } from "./certificate"
export { getLessonProgressByUser, getLessonById } from "./lesson"
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/queries/course.ts lib/queries/index.ts
git commit -m "feat(queries): add platform stats, top reviews, and course-by-ID queries"
```

---

## Task 9: Fix Student Count in Serializer

**Files:**
- Modify: `lib/serializers.ts:72`
- Modify: `lib/queries/course.ts` (courseInclude)

- [ ] **Step 1: Update courseInclude to fetch instructor's enrollment count**

In `lib/queries/course.ts`, update the `courseInclude` constant to include instructor enrollment count:

```typescript
const courseInclude = {
  instructor: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      _count: { select: { courses: true } },
    },
  },
  category: { select: { id: true, name: true, slug: true } },
} as const
```

- [ ] **Step 2: Update serializer to compute studentCount from course data**

In `lib/serializers.ts`, update the `PrismaInstructor` type and `serializeCourse` function. The `studentCount` needs data we can't easily get from the instructor relation alone. Best approach: pass the instructor's total enrollment count. Update the serializer:

In `lib/serializers.ts`, change the `studentCount` line (line 72) from:

```typescript
      studentCount: 0,
```

to:

```typescript
      studentCount: c.enrollmentCount,
```

This uses the course's own enrollment count as a proxy. While not the instructor's total across all courses, it's accurate per-course context and avoids an extra query.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/serializers.ts lib/queries/course.ts
git commit -m "fix(serializers): replace hardcoded studentCount with real enrollment data"
```

---

## Task 10: Fix Landing Page — Real Stats + Real Testimonials

**Files:**
- Modify: `app/(marketing)/page.tsx`

- [ ] **Step 1: Replace mock imports and hardcoded stats**

In `app/(marketing)/page.tsx`, make these changes:

1. Replace the import line (line 6):
```typescript
// OLD:
import { MOCK_TESTIMONIALS } from "@/mock/data"
// NEW:
import { getFeaturedCourses, getPlatformStats, getTopReviews } from "@/lib/queries"
```

2. Remove the duplicate `getFeaturedCourses` import from line 7 (already covered above).

3. Update the component to fetch real data. After line 10 (`const featuredCourses = ...`), add:
```typescript
  const [platformStats, topReviews] = await Promise.all([
    getPlatformStats(),
    getTopReviews(3),
  ])
```

4. Replace the hardcoded stats section (lines 96-106). Change:
```typescript
<span className="text-3xl font-extrabold text-on-surface">12,000+</span>
```
to:
```typescript
<span className="text-3xl font-extrabold text-on-surface">{platformStats.totalStudents.toLocaleString()}+</span>
```

Change:
```typescript
<span className="text-3xl font-extrabold text-on-surface">200+</span>
```
to:
```typescript
<span className="text-3xl font-extrabold text-on-surface">{platformStats.totalCourses}+</span>
```

Change:
```typescript
<span className="text-3xl font-extrabold text-tertiary">98%</span>
```
to:
```typescript
<span className="text-3xl font-extrabold text-tertiary">{platformStats.avgRating > 0 ? `${platformStats.avgRating}/5` : "—"}</span>
```

And change the label "Completion Rate" to "Avg. Rating".

5. Replace `MOCK_TESTIMONIALS.map(...)` (line 194) with `topReviews.map(...)`. The `topReviews` objects already match the shape used in the template (`id`, `quote`, `authorName`, `authorRole`, `authorCompany`, `avatarUrl`).

6. Also update the CTA section hardcoded "12,000+" (line 234) to use `{platformStats.totalStudents.toLocaleString()}+`.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/page.tsx"
git commit -m "fix(landing): replace mock testimonials and hardcoded stats with real DB queries"
```

---

## Task 11: Fix Student Dashboard — Real Activity Feed

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace MOCK_ACTIVITY with notifications query**

In `app/(dashboard)/dashboard/page.tsx`:

1. Remove the mock import (line 9):
```typescript
// DELETE this line:
import { MOCK_ACTIVITY } from "@/mock/data"
```

2. Update the imports from `@/lib/queries` (line 8) to include `getNotificationsByUser`:
```typescript
import { getStudentStats, getCertificatesByUser, getEnrollmentsByUser, getNotificationsByUser } from "@/lib/queries"
```

3. After the `certificates` fetch (line 20), add:
```typescript
  const notifications = await getNotificationsByUser(currentUser.id)
  const activityItems = notifications.slice(0, 5).map((n) => ({
    id: n.id,
    type: n.type === "ENROLLMENT" ? "ENROLLED" as const
      : n.type === "CERTIFICATE_ISSUED" ? "CERTIFICATE_EARNED" as const
      : n.type === "QUIZ_PASSED" ? "QUIZ_PASSED" as const
      : "LESSON_COMPLETED" as const,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    metadata: (n.metadata as Record<string, string>) ?? {},
  }))
```

4. Replace `{MOCK_ACTIVITY.map((item) => (` (line 181) with `{activityItems.map((item) => (`.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/page.tsx"
git commit -m "fix(dashboard): replace mock activity feed with real notifications query"
```

---

## Task 12: Fix Instructor Dashboard — Dynamic Course Slug

**Files:**
- Modify: `app/(dashboard)/dashboard/instructor/page.tsx:33-36`

- [ ] **Step 1: Remove hardcoded slug**

In `app/(dashboard)/dashboard/instructor/page.tsx`, replace lines 33-36:

```typescript
  // OLD:
  const firstCourse = courses.find((c) => c.status === "PUBLISHED")
  const courseDetail = firstCourse ? await getCourseBySlug("nextjs-14-fullstack-saas") : null
  const reviews = courseDetail?.reviews ?? []
```

with:

```typescript
  // Get reviews from all instructor's courses
  const allReviews = await prisma.review.findMany({
    where: { course: { instructorId: currentUser.id } },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
  const reviews = allReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    student: {
      id: r.user.id,
      fullName: r.user.name ?? "",
      avatarUrl: r.user.avatarUrl,
    },
  }))
```

Also update the imports — add `prisma`:
```typescript
import { prisma } from "@/lib/db"
```

And remove the unused `getCourseBySlug` from the import on line 9.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/instructor/page.tsx"
git commit -m "fix(instructor): replace hardcoded course slug with dynamic reviews query"
```

---

## Task 13: Fix Player Page — Extract Direct Prisma Call

**Files:**
- Modify: `app/(player)/learn/[courseId]/[lessonId]/page.tsx`

- [ ] **Step 1: Replace direct Prisma call with query function**

In `app/(player)/learn/[courseId]/[lessonId]/page.tsx`, make these changes:

1. Remove the Prisma import (line 4):
```typescript
// DELETE:
import { prisma } from "@/lib/db"
```

2. Update the imports from `@/lib/queries` (line 2):
```typescript
// OLD:
import { getCourseBySlug, getLessonById, getLessonProgressByUser } from "@/lib/queries"
// NEW:
import { getCourseWithCurriculum, getLessonProgressByUser } from "@/lib/queries"
```

3. Replace the course fetching logic (lines 14-21):
```typescript
  // OLD:
  const courseRow = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  })
  if (!courseRow) notFound()

  const course = await getCourseBySlug(courseRow.slug)
  if (!course) notFound()

  // NEW:
  const course = await getCourseWithCurriculum(courseId)
  if (!course) notFound()
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add "app/(player)/learn/[courseId]/[lessonId]/page.tsx"
git commit -m "refactor(player): extract direct Prisma call to query layer"
```

---

## Task 14: Fix Dead Links

**Files:**
- Modify: `app/auth/login/page.tsx:78`
- Modify: `app/auth/register/page.tsx:160-162`

- [ ] **Step 1: Fix "Forgot password?" in login page**

In `app/auth/login/page.tsx`, replace line 78:

```tsx
// OLD:
<button type="button" className="text-xs text-primary hover:underline">
  Forgot password?
</button>

// NEW:
<span className="text-xs text-on-surface-variant cursor-not-allowed" title="Coming soon">
  Forgot password?
</span>
```

- [ ] **Step 2: Fix Terms/Privacy in register page**

In `app/auth/register/page.tsx`, replace lines 160-162:

```tsx
// OLD:
<span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{" "}
<span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.

// NEW:
<span className="text-on-surface-variant cursor-not-allowed" title="Coming soon">Terms of Service</span> and{" "}
<span className="text-on-surface-variant cursor-not-allowed" title="Coming soon">Privacy Policy</span>.
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/auth/login/page.tsx app/auth/register/page.tsx
git commit -m "fix(auth): disable dead links with coming-soon styling"
```

---

## Task 15: Update Documentation

**Files:**
- Modify: `docs/learnify-prd.md:9`
- Modify: `CLAUDE.md` header

- [ ] **Step 1: Update PRD phase status**

In `docs/learnify-prd.md`, change line 9 from:

```markdown
**Current Phase:** Phase 1 — UI with Mock Data
```

to:

```markdown
**Current Phase:** Phase 3 — Backend Foundation
```

- [ ] **Step 2: Update CLAUDE.md header**

In `CLAUDE.md`, update the header comment from:

```markdown
> This is the CLAUDE.md governing Claude Code behavior for the **UI Phase** of Learnify.
> All data is sourced from mock files. No real API calls, database queries, or auth checks.
```

to:

```markdown
> This is the CLAUDE.md governing Claude Code behavior for the **Backend Phase** of Learnify.
> Phase 3 active: Server actions and real database queries. Mock data being phased out.
```

- [ ] **Step 3: Commit**

```bash
git add docs/learnify-prd.md CLAUDE.md
git commit -m "docs: update PRD and CLAUDE.md to reflect Phase 3 status"
```

---

## Task 16: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: Zero errors

- [ ] **Step 2: Run linter**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 3: Verify dev server starts**

Run: `pnpm dev`
Expected: Server starts without build errors. Check terminal for any runtime warnings.

- [ ] **Step 4: Verify no remaining mock imports in pages**

Run: `grep -r "from.*@/mock" app/ --include="*.tsx" --include="*.ts"`
Expected: No results (all mock imports removed from app/ pages)

- [ ] **Step 5: Commit any final fixes if needed**

```bash
git add -A
git commit -m "chore: final Phase 3 cleanup and verification"
```
