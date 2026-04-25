# Phase 3 Completion — Server Actions & Data Layer Fixes

**Date:** 2026-04-25
**Status:** Approved
**Author:** Alan Ari Mahendra

---

## Overview

Complete Phase 3 backend foundation by implementing missing server actions, replacing all remaining mock data with real database queries, and fixing identified issues from codebase screening.

**Scope:** Server actions (enrollment, progress, quiz, review, course status), query fixes, mock data removal.
**Out of scope:** Course builder UI, payment gateway, video streaming, drag-and-drop, timer/retake quiz logic, streak calculation.

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Enrollment flow (free vs paid) | Free instant + fake paid (Order with COMPLETED) | Full data flow without Stripe dependency. Phase 4 swaps with real gateway |
| Activity feed source | Notification table | Already has all event types. Single table for bell + feed |
| Monthly revenue aggregation | Raw SQL DATE_TRUNC | Clean, performant, shows real backend skill |
| Quiz depth | Basic scoring only | Submit, score, save attempt, pass/fail. No timer/retake limits |
| Streak calculation | Skip (keep 0) | Vanity metric, not core LMS. Revisit Phase 4 |
| Course CRUD | Status management only | publish/archive/delete. Full builder in Phase 4 |

---

## 1. Server Actions

### File Structure

```
lib/actions/
├── enrollment.ts    — enrollInCourse
├── progress.ts      — markLessonComplete, updateWatchProgress
├── quiz.ts          — submitQuizAttempt
├── review.ts        — submitReview
├── course.ts        — publishCourse, archiveCourse, deleteCourse
```

### Common Patterns

All actions follow existing `lib/auth/actions.ts` conventions:
- `"use server"` directive
- Zod validation on inputs
- `requireAuth()` / `requireRole()` guards from `lib/auth/guards.ts`
- Return `ActionResult` type: `{ success: true } | { success: false; error: string }`
- Create `Notification` entry on key events
- Update cached counters in same transaction where applicable

### 1.1 Enrollment Action (`lib/actions/enrollment.ts`)

**`enrollInCourse(courseId: string)`**

Guards:
- `requireAuth()` — must be logged in
- Role must be `STUDENT`
- Cannot enroll in own course (check `course.instructorId !== userId`)
- Cannot double-enroll (check existing Enrollment)

Flow (free course — `price === 0`):
1. Create `Enrollment` with `progressPercent = 0`
2. Increment `course.enrollmentCount`
3. Create `Notification(ENROLLMENT)` for student
4. All in `prisma.$transaction`

Flow (paid course — `price > 0`):
1. Create `Order` with `status = COMPLETED`, `amount = course.price`, `paymentId = "demo_" + crypto.randomUUID()`
2. Create `Enrollment` with `progressPercent = 0`
3. Increment `course.enrollmentCount`
4. Create `Notification(ENROLLMENT)` for student
5. All in `prisma.$transaction`

Phase 4 migration: Replace fake Order creation with Stripe Checkout session. On `payment_intent.succeeded` webhook, execute steps 2-4.

### 1.2 Progress Actions (`lib/actions/progress.ts`)

**`markLessonComplete(lessonId: string)`**

Guards:
- `requireAuth()`
- Verify user enrolled in lesson's parent course

Flow:
1. Upsert `LessonProgress` — set `isCompleted = true`, `completedAt = now()`
2. Recalculate `Enrollment.progressPercent`:
   ```
   completedLessons = LessonProgress.count(isCompleted=true, lessonId in course lessons)
   totalLessons = Lesson.count(deletedAt=null, chapter.courseId=courseId, chapter.deletedAt=null)
   progressPercent = Math.round((completedLessons / totalLessons) * 100)
   ```
3. Update `Enrollment.progressPercent`
4. If `progressPercent === 100`:
   - Create `Certificate` with `verifyCode = crypto.randomUUID().slice(0, 12)`
   - Create `Notification(CERTIFICATE_EARNED)` for student
5. All in `prisma.$transaction`

**`updateWatchProgress(lessonId: string, watchedSeconds: number)`**

Guards: same as above

Flow:
1. Upsert `LessonProgress` — update `watchedSeconds` only
2. No completion logic, no transaction needed
3. Lightweight — fires periodically from video player client

### 1.3 Quiz Action (`lib/actions/quiz.ts`)

**`submitQuizAttempt(quizId: string, answers: { questionId: string; selectedOptionId: string }[])`**

Guards:
- `requireAuth()`
- Verify user enrolled in quiz's parent course

Flow:
1. Fetch Quiz with Questions + QuestionOptions
2. Score: for each answer, check if `selectedOptionId` matches `QuestionOption` where `isCorrect = true`
3. Calculate `score = Math.round((correctCount / totalQuestions) * 100)`
4. Determine `passed = score >= quiz.passingScore`
5. Create `QuizAttempt` with `score`, `passed`, `answers` (JSON snapshot of submitted answers)
6. If passed: create `Notification(QUIZ_PASSED)` + mark associated lesson as complete (via `markLessonComplete` logic)

No timer enforcement. No retake limit checks. Phase 4 adds those.

### 1.4 Review Action (`lib/actions/review.ts`)

**`submitReview(courseId: string, rating: number, comment: string)`**

Guards:
- `requireAuth()`
- Verify user enrolled in course
- Verify `progressPercent === 100` (must complete course to review)
- Check no existing review by this user on this course

Validation (Zod):
- `rating`: integer, 1-5
- `comment`: string, 10-1000 chars

Flow:
1. Create `Review`
2. Recalculate `course.rating` = avg of all reviews, `course.reviewCount` = count
3. Create `Notification(REVIEW_RECEIVED)` for course instructor (notified `userId = course.instructorId`)
4. All in `prisma.$transaction`

### 1.5 Course Status Actions (`lib/actions/course.ts`)

**`publishCourse(courseId: string)`**
- Guard: `requireAuth()` + `requireRole(["TEACHER", "ADMIN"])` + verify owns course
- Set `course.status = "PUBLISHED"`

**`archiveCourse(courseId: string)`**
- Same guard
- Set `course.status = "ARCHIVED"`

**`deleteCourse(courseId: string)`**
- Same guard
- Soft delete: set `course.deletedAt = now()`

---

## 2. Query Fixes

### 2.1 Monthly Revenue (`lib/queries/instructor.ts`)

Replace empty `monthlyRevenue: []` with raw SQL:

```sql
SELECT
  TO_CHAR(DATE_TRUNC('month', o."createdAt"), 'YYYY-MM') AS month,
  SUM(o."amount")::float AS revenue
FROM "Order" o
JOIN "Course" c ON o."courseId" = c."id"
WHERE c."instructorId" = $1
  AND o."status" = 'COMPLETED'
  AND o."createdAt" >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', o."createdAt")
ORDER BY month ASC
```

Returns last 12 months of revenue data for recharts.

### 2.2 Student Count in Serializer (`lib/serializers.ts`)

Replace hardcoded `studentCount: 0` in `serializeInstructorSummary`:
- Query `Enrollment.count` where `course.instructorId = instructor.id`
- Or pass pre-computed count from query layer

### 2.3 Landing Page Stats (`app/(marketing)/page.tsx`)

Replace hardcoded "12,000+", "200+", "98%":
- New query `getPlatformStats()` in `lib/queries/course.ts`:
  - `totalStudents`: count distinct `Enrollment.userId`
  - `totalCourses`: count published courses
  - `avgRating`: avg of all course ratings

### 2.4 Testimonials (`app/(marketing)/page.tsx`)

Replace `MOCK_TESTIMONIALS`:
- New query `getTopReviews(limit: number)` in `lib/queries/course.ts`:
  - Fetch reviews with `rating >= 4`, include user + course info
  - Order by `createdAt DESC`, take `limit`

### 2.5 Activity Feed (`app/(dashboard)/dashboard/page.tsx`)

Replace `MOCK_ACTIVITY`:
- Use existing `getNotificationsByUser(userId)` from `lib/queries/student.ts`
- Map `Notification` rows to `ActivityItem` type in page component

### 2.6 Instructor Dashboard Dynamic Course (`app/(dashboard)/dashboard/instructor/page.tsx`)

Replace hardcoded slug `"nextjs-14-fullstack-saas"`:
- Use first course from `coursePerformance` array (already queried)
- Or fetch `getCourseBySlug(firstCourse.slug)` dynamically

### 2.7 Player Page Direct Prisma Call (`app/(player)/learn/[courseId]/[lessonId]/page.tsx`)

Move `prisma.course.findUnique()` to query layer:
- Add `getCourseWithCurriculum(courseId: string)` in `lib/queries/course.ts`
- Player page imports from query layer, not Prisma directly

---

## 3. Dead Link Fixes

| Link | Current | Fix |
|------|---------|-----|
| Forgot password (`auth/login`) | No href | `href="#"` + `text-on-surface-variant cursor-not-allowed` + tooltip "Coming soon" |
| Terms of Service (`auth/register`) | No href | Same treatment |
| Privacy Policy (`auth/register`) | Same | Same treatment |
| Certificate PDF download | Non-functional button | Disable with "Coming in Phase 4" tooltip |

---

## 4. Doc Updates

| File | Change |
|------|--------|
| `docs/learnify-prd.md` line 9 | Update "Current Phase" from "Phase 1" to "Phase 3" |
| `CLAUDE.md` header | Update to reflect Phase 3 status (backend active) |

---

## 5. Validation Schemas

New file `lib/actions/schemas.ts`:

```typescript
import { z } from "zod"

export const EnrollmentSchema = z.object({
  courseId: z.string().min(1),
})

export const LessonCompleteSchema = z.object({
  lessonId: z.string().min(1),
})

export const WatchProgressSchema = z.object({
  lessonId: z.string().min(1),
  watchedSeconds: z.number().int().min(0),
})

export const QuizSubmitSchema = z.object({
  quizId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    selectedOptionId: z.string().min(1),
  })).min(1),
})

export const ReviewSchema = z.object({
  courseId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
})

export const CourseStatusSchema = z.object({
  courseId: z.string().min(1),
})
```

---

## 6. Dependencies

No new packages needed. Use `crypto.randomUUID()` for Order `paymentId` ("demo_" prefix + UUID). Use `crypto.randomUUID().slice(0, 12)` for Certificate `verifyCode`. All other deps already in `package.json`.

---

## Summary of Deliverables

| # | Deliverable | Files |
|---|------------|-------|
| 1 | Enrollment server action | `lib/actions/enrollment.ts`, `lib/actions/schemas.ts` |
| 2 | Progress server actions | `lib/actions/progress.ts` |
| 3 | Quiz server action | `lib/actions/quiz.ts` |
| 4 | Review server action | `lib/actions/review.ts` |
| 5 | Course status actions | `lib/actions/course.ts` |
| 6 | Monthly revenue query fix | `lib/queries/instructor.ts` |
| 7 | Student count fix | `lib/serializers.ts` |
| 8 | Landing page real stats | `lib/queries/course.ts`, `app/(marketing)/page.tsx` |
| 9 | Testimonials from DB | `lib/queries/course.ts`, `app/(marketing)/page.tsx` |
| 10 | Activity feed from Notifications | `app/(dashboard)/dashboard/page.tsx` |
| 11 | Instructor dashboard dynamic course | `app/(dashboard)/dashboard/instructor/page.tsx` |
| 12 | Player page query extraction | `lib/queries/course.ts`, player page |
| 13 | Dead link fixes | auth pages, certificate page |
| 14 | Doc updates | `docs/learnify-prd.md`, `CLAUDE.md` |
