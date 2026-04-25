# Phase 4 & 5 — Business Logic & Portfolio Completion

**Date:** 2026-04-25
**Status:** Approved
**Author:** Alan Ari Mahendra

---

## Overview

Complete Phase 4 (business logic) and Phase 5 (cleanup) for portfolio-ready state. Focus on visible, functional features. No real payment gateway or video hosting.

**Scope:** Course builder (form-based), admin panel (users + course approval), quiz UI in player, certificate print, sidebar updates, cached counter maintenance.

**Out of scope:** Stripe/Midtrans integration, Mux/Bunny video hosting, drag-and-drop reordering, formal QA/deploy, PDF generation library.

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Payment/Video | Skip real Stripe/Mux | Portfolio — demo flow sufficient, no API keys needed |
| Course builder | Form-based CRUD | Functional, shows full CRUD. dnd-kit is polish, not substance |
| Admin panel | Users + course approval | Shows RBAC in action. Skip analytics (redundant with landing stats) |
| Certificate | Print CSS + window.print() | No new dependency. Print-friendly layout sufficient |
| Phase 5 QA | tsc + lint only | User does visual review manually |

---

## 1. Course Builder

### Routes

```
app/(dashboard)/dashboard/instructor/
├── courses/
│   ├── new/page.tsx                    — Create course form
│   └── [courseId]/
│       ├── page.tsx                    — Edit course + manage chapters/lessons
│       └── chapters/
│           └── [chapterId]/page.tsx    — Edit chapter + manage lessons
```

### Server Actions (extend `lib/actions/course.ts`)

**`createCourse(data)`**
- Guard: `requireRole(["TEACHER", "ADMIN"])`
- Validation: title (3-200), description (10-5000), shortDesc (10-500), price (>= 0), level, categoryId, thumbnailUrl
- Auto-generate slug from title (lowercase, hyphenated, append random suffix for uniqueness)
- Set status = DRAFT, instructorId = current user
- Return `{ success: true, courseId }` or `{ success: false, error }`

**`updateCourse(courseId, data)`**
- Guard: requireRole + verify ownership
- Same validation as create
- Update slug if title changed

**`createChapter(courseId, data)`**
- Guard: requireRole + verify course ownership
- Fields: title, description
- Auto-assign position = max(existing positions) + 1

**`updateChapter(chapterId, data)`**
- Guard: requireRole + verify ownership chain (chapter → course → instructor)
- Fields: title, description

**`deleteChapter(chapterId)`**
- Soft delete (set deletedAt)
- Also soft-delete all lessons in chapter

**`createLesson(chapterId, data)`**
- Guard: requireRole + verify ownership chain
- Fields: title, type (VIDEO/TEXT/QUIZ), content, videoUrl, duration
- Auto-assign position = max(existing positions) + 1
- Update course cached counters: totalLessons, totalDuration

**`updateLesson(lessonId, data)`**
- Same guard + fields
- Recalculate course counters

**`deleteLesson(lessonId)`**
- Soft delete
- Recalculate course counters

### Validation Schemas (add to `lib/actions/schemas.ts`)

```typescript
export const CreateCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  shortDesc: z.string().min(10).max(500),
  price: z.number().min(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  categoryId: z.string().min(1),
  thumbnailUrl: z.string().url(),
})

export const UpdateCourseSchema = CreateCourseSchema.partial().extend({
  courseId: z.string().min(1),
})

export const CreateChapterSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
})

export const UpdateChapterSchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
})

export const CreateLessonSchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1).max(200),
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
```

### UI Components

**Create Course Page (`new/page.tsx`)**
- Server component wrapper with `requireRole(["TEACHER", "ADMIN"])`
- Client form component with all fields
- Category dropdown populated from `getCategories()` query
- On success: redirect to `/dashboard/instructor/courses/[courseId]`

**Edit Course Page (`[courseId]/page.tsx`)**
- Server component: fetch course with chapters + lessons
- Client component with:
  - Course info form (editable)
  - Chapters list with "Add Chapter" button
  - Each chapter expandable: shows lessons + "Add Lesson" button
  - Inline edit for chapter title/description
  - Publish/Unpublish/Archive buttons using existing actions

**Chapter Detail Page (`[chapterId]/page.tsx`)**
- Optional deep-edit page for chapter + its lessons
- Or: handle everything inline on course edit page (simpler)
- Decision: handle inline on course edit page. No separate chapter page.

### Slug Generation

```typescript
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const suffix = crypto.randomUUID().slice(0, 6)
  return `${base}-${suffix}`
}
```

---

## 2. Admin Panel

### Routes

```
app/(dashboard)/dashboard/admin/
├── page.tsx              — Redirect to users
├── users/page.tsx        — User management
└── courses/page.tsx      — Course approval
```

### Server Actions (`lib/actions/admin.ts`)

**`toggleUserActive(userId)`**
- Guard: `requireRole(["ADMIN"])`
- Toggle `user.isActive`
- Create audit log entry
- Return updated status

**`changeUserRole(userId, role)`**
- Guard: `requireRole(["ADMIN"])`
- Update `user.role`
- Create audit log: `ROLE_CHANGE` with `{ oldRole, newRole }`
- Return success

**`approveCourse(courseId)`**
- Guard: `requireRole(["ADMIN"])`
- Set `course.status = PUBLISHED`, `publishedAt = now()`
- Create `Notification(COURSE_APPROVED)` for instructor
- Return success

**`rejectCourse(courseId, reason)`**
- Guard: `requireRole(["ADMIN"])`
- Set `course.status = DRAFT`
- Create `Notification(COURSE_REJECTED)` for instructor with reason in metadata
- Return success

### Validation Schemas

```typescript
export const ToggleUserSchema = z.object({
  userId: z.string().min(1),
})

export const ChangeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
})

export const RejectCourseSchema = z.object({
  courseId: z.string().min(1),
  reason: z.string().min(5).max(500),
})
```

### Queries (`lib/queries/admin.ts`)

**`getAllUsers()`**
- Fetch all users with role, isActive, createdAt
- Order by createdAt desc

**`getPendingCourses()`**
- Fetch courses with status in [DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED]
- Include instructor name
- Order by createdAt desc

### UI

**Users page:**
- Table: avatar, name, email, role badge, status (Active/Banned), joined date
- Actions column: role select dropdown, ban/unban toggle button
- Client-side search filter by name/email
- useTransition for action loading states

**Courses page:**
- Table: thumbnail, title, instructor, status badge, created date
- Status filter tabs: All / Pending / Published / Draft / Archived
- Actions: Approve button (for PENDING_REVIEW/DRAFT), Reject button (shows reason textarea)
- useTransition for action loading states

---

## 3. Quiz UI in Player

### Query

Add to `lib/queries/lesson.ts`:

**`getQuizByLessonId(lessonId)`**
- Fetch quiz where `quiz.lessonId = lessonId`
- Include questions (ordered by position) with options (ordered by position)
- Strip `isCorrect` from options in response (don't leak answers to client)
- Return `Quiz | null`

### Player Integration

In `player-client.tsx`, when `lesson.type === "QUIZ"`:
- Instead of video player, show quiz interface
- Fetch quiz data (passed as prop from server component)
- Render each question with radio button options
- "Submit Quiz" button calls `submitQuizAttempt`
- After submit: show score, pass/fail, retry option

### New Prop

Server component `page.tsx` needs to pass quiz data:
```typescript
const quiz = lesson.type === "QUIZ" ? await getQuizByLessonId(lesson.id) : null
// pass to client: <VideoPlayerPage ... quiz={quiz} />
```

---

## 4. Certificate Print

### Changes to `app/certificate/[verifyCode]/page.tsx`

- Add "Print Certificate" button: `<button onClick={() => window.print()}>Print</button>`
- Add `@media print` styles in component or globals.css:
  - Hide navbar, footer, print button
  - White background, black text
  - Clean certificate layout centered on page
  - Show verify code prominently

---

## 5. Sidebar Updates

### `components/dashboard/SidebarNav.tsx`

Add role-based nav items:

**ADMIN:**
- "Users" → `/dashboard/admin/users` (icon: `group`)
- "Courses" → `/dashboard/admin/courses` (icon: `menu_book`)

**TEACHER:**
- "My Courses" → `/dashboard/instructor/courses` (icon: `edit_note`)

**STUDENT (existing):**
- Keep current items

---

## 6. Cached Counter Maintenance

When chapters/lessons are created or deleted, recalculate:
- `course.totalLessons` = count of non-deleted lessons across non-deleted chapters
- `course.totalDuration` = sum of lesson durations across non-deleted chapters

Helper function in `lib/actions/course.ts`:

```typescript
async function recalculateCourseCounts(tx: PrismaTransaction, courseId: string) {
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
```

---

## 7. PRD & Doc Updates

- Update `docs/learnify-prd.md` phase status to "Phase 4"
- Final tsc + lint verification

---

## Summary of Deliverables

| # | Deliverable | Files |
|---|------------|-------|
| 1 | Course builder schemas | `lib/actions/schemas.ts` |
| 2 | Course builder actions (CRUD) | `lib/actions/course.ts` |
| 3 | Create course page | `app/(dashboard)/dashboard/instructor/courses/new/page.tsx` |
| 4 | Edit course page | `app/(dashboard)/dashboard/instructor/courses/[courseId]/page.tsx` |
| 5 | Instructor courses list | `app/(dashboard)/dashboard/instructor/courses/page.tsx` |
| 6 | Admin actions | `lib/actions/admin.ts` |
| 7 | Admin queries | `lib/queries/admin.ts` |
| 8 | Admin users page | `app/(dashboard)/dashboard/admin/users/page.tsx` |
| 9 | Admin courses page | `app/(dashboard)/dashboard/admin/courses/page.tsx` |
| 10 | Quiz query | `lib/queries/lesson.ts` |
| 11 | Quiz UI in player | `player-client.tsx`, `page.tsx` |
| 12 | Certificate print | `certificate/[verifyCode]/page.tsx`, `globals.css` |
| 13 | Sidebar updates | `SidebarNav.tsx` |
| 14 | Counter maintenance | `lib/actions/course.ts` |
| 15 | Doc updates | `learnify-prd.md` |
