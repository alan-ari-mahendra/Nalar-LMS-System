# CLAUDE.md — Learnify UI Phase

> This is the CLAUDE.md governing Claude Code behavior for the **UI Phase** of Learnify.
> All data is sourced from mock files. No real API calls, database queries, or auth checks.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript — strict mode |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | Material Symbols Outlined (Google Fonts / npm: `material-symbols`) |
| Charts | recharts |
| Fonts | next/font/google |
| Images | next/image |

---

## Design System — Obsidian Theme

Source of truth: `docs/stitch-design/obsidian/DESIGN.md` + HTML exports.

### Tailwind Config — Add to `tailwind.config.ts`

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Core tokens (from Stitch Obsidian theme)
      "primary":                    "#a78bfa", // violet-400 — interactive, links, focus
      "primary-container":          "#7c3aed", // deeper violet — hover states
      "primary-fixed":              "#ede9fe",
      "primary-fixed-dim":          "#c4b5fd",
      "on-primary":                 "#0a0012",
      "on-primary-container":       "#ede9fe",

      "background":                 "#09090b", // near-black
      "on-background":              "#fafafa",

      "surface":                    "#0c0c0f",
      "surface-dim":                "#0c0c0f",
      "surface-bright":             "#18181b",
      "surface-variant":            "#18181b",
      "surface-container-lowest":   "#09090b",
      "surface-container-low":      "#0f0f12",
      "surface-container":          "#121215",
      "surface-container-high":     "#18181b",
      "surface-container-highest":  "#1e1e22",
      "on-surface":                 "#fafafa",
      "on-surface-variant":         "#a1a1aa",

      "outline":                    "#52525b", // subtle borders
      "outline-variant":            "#27272a", // card borders, dividers

      "tertiary":                   "#34d399", // emerald — success, positive
      "tertiary-container":         "#065f46",
      "on-tertiary-container":      "#bbf7d0",

      "secondary":                  "#71717a",
      "secondary-container":        "#27272a",
      "on-secondary-container":     "#a1a1aa",

      "error":                      "#ef4444",
      "error-container":            "#3b1111",
      "on-error-container":         "#fca5a5",
    },
    fontFamily: {
      headline: ["Geist", "sans-serif"],
      body:     ["Geist", "sans-serif"],
      label:    ["Geist", "sans-serif"],
    },
    borderRadius: {
      DEFAULT: "0.25rem",
      lg:      "0.5rem",
      xl:      "0.75rem",
      full:    "9999px",
    },
  },
}
```

### Add to `app/layout.tsx`

```tsx
// Font via next/font
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

// Icons — Material Symbols (add to <head>)
// <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />

// OR install the npm package:
// npm install material-symbols
// then in layout.tsx: import "material-symbols"
```

### Icon Usage — Material Symbols (NOT lucide-react)

```tsx
// CORRECT — Material Symbols Outlined
<span className="material-symbols-outlined">bolt</span>
<span className="material-symbols-outlined !text-sm">star</span>
<span className="material-symbols-outlined !text-4xl text-primary">search</span>

// Size control via text-* classes
// Color via text-* or text-primary etc.

// WRONG — do not use lucide-react for UI icons
import { Bolt } from "lucide-react" // ❌
```

### Component Patterns (Stitch-accurate)

```tsx
// Card
<div className="bg-surface-container border border-outline-variant rounded-xl p-6">

// Card with hover
<div className="group bg-surface-container border border-outline-variant rounded-xl hover:border-primary/50 transition-all">

// Primary Button
<button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:brightness-110 transition-all">

// Secondary Button
<button className="border border-outline-variant bg-surface-container-low text-on-surface px-4 py-2 rounded-xl font-bold hover:bg-surface-container transition-all">

// Input
<input className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">

// Badge (category)
<span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded">
  WEB DEV
</span>

// Badge (success / free)
<span className="px-2 py-1 bg-tertiary-container text-tertiary text-xs font-bold rounded">
  Free
</span>

// Section Header
<h2 className="text-3xl font-bold tracking-tighter text-on-surface">

// Muted text
<p className="text-on-surface-variant text-sm">

// Animated ping badge (new/live indicator)
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
```

### Background Effects

```tsx
// Grid dot background (hero section)
// Add to globals.css:
// .grid-bg { background-image: radial-gradient(#27272a 1px, transparent 1px); background-size: 40px 40px; }
<section className="grid-bg"> ... </section>

// Glow blobs (decorative)
<div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
<div className="absolute -bottom-12 -left-12 w-64 h-64 bg-tertiary/10 rounded-full blur-[100px]" />
```

---

## Mock Data Rules

### CRITICAL: No real data fetching in UI phase

```tsx
// CORRECT — import from mock
import { MOCK_COURSES, MOCK_ENROLLMENTS } from "@/mock/data"

// WRONG — never do this in UI phase
const courses = await prisma.course.findMany()
const { data } = await supabase.from("courses").select()
```

### Import Paths

```tsx
import type { Course, Enrollment, Profile } from "@/type"
import {
  MOCK_COURSES,
  MOCK_CATEGORIES,
  MOCK_COURSE_DETAIL,
  MOCK_CURRENT_USER,
  MOCK_ENROLLMENTS,
  MOCK_STUDENT_STATS,
  MOCK_CERTIFICATES,
  MOCK_NOTIFICATIONS,
  MOCK_ACTIVITY,
  MOCK_INSTRUCTOR_STATS,
  MOCK_COURSE_PERFORMANCE,
  MOCK_INSTRUCTORS,
  formatDuration,
  formatPrice,
  formatCount,
  formatRelativeTime,
} from "@/mock/data"
```

### Data Usage per Page

| Page | Mock Data to Use |
|---|---|
| `/` Landing | `MOCK_COURSES` (first 3 published), `MOCK_CATEGORIES` |
| `/courses` Catalog | `MOCK_COURSES`, `MOCK_CATEGORIES` |
| `/courses/[slug]` Detail | `MOCK_COURSE_DETAIL` (static, ignore slug) |
| `/learn/[courseId]/[lessonId]` | `MOCK_COURSE_DETAIL`, `MOCK_LESSON_PROGRESS` |
| `/dashboard` Student | `MOCK_CURRENT_USER`, `MOCK_STUDENT_STATS`, `MOCK_ENROLLMENTS`, `MOCK_CERTIFICATES`, `MOCK_ACTIVITY` |
| `/dashboard/instructor` | `MOCK_CURRENT_USER`, `MOCK_INSTRUCTOR_STATS`, `MOCK_COURSE_PERFORMANCE` |
| `/certificate/[code]` | `MOCK_CERTIFICATES[0]` (static) |

---

## File & Folder Structure

```
app/
├── (marketing)/
│   ├── layout.tsx           ← navbar + footer
│   ├── page.tsx             ← landing
│   └── courses/
│       ├── page.tsx         ← catalog
│       └── [slug]/
│           └── page.tsx     ← detail
├── (player)/
│   ├── layout.tsx           ← fullscreen, no navbar
│   └── learn/
│       └── [courseId]/
│           └── [lessonId]/
│               └── page.tsx ← player
├── (dashboard)/
│   ├── layout.tsx           ← sidebar layout
│   ├── dashboard/
│   │   └── page.tsx         ← student home
│   └── dashboard/
│       └── instructor/
│           └── page.tsx     ← instructor home
└── certificate/
    └── [verifyCode]/
        └── page.tsx         ← public certificate
components/
├── ui/                      ← shadcn primitives only
├── marketing/               ← landing page sections
│   ├── navbar.tsx
│   ├── hero.tsx
│   ├── stats-bar.tsx
│   ├── featured-courses.tsx
│   ├── how-it-works.tsx
│   ├── testimonials.tsx
│   ├── cta-banner.tsx
│   └── footer.tsx
├── course/
│   ├── course-card.tsx      ← reused in catalog + landing
│   ├── course-catalog.tsx
│   ├── course-filter.tsx
│   ├── course-detail-tabs.tsx
│   ├── curriculum-sidebar.tsx
│   └── video-player.tsx
├── dashboard/
│   ├── sidebar.tsx
│   ├── stats-card.tsx
│   ├── enrollment-card.tsx
│   ├── certificate-card.tsx
│   ├── activity-feed.tsx
│   ├── revenue-chart.tsx
│   └── course-table.tsx
└── shared/
    ├── avatar.tsx
    ├── rating-stars.tsx
    ├── progress-bar.tsx
    ├── notification-bell.tsx
    └── breadcrumb.tsx
mock/
└── data.ts                  ← ALL mock data lives here
type/
└── index.ts                 ← ALL TypeScript types
lib/
└── utils.ts                 ← cn(), shared formatters
```

---

## TypeScript Rules

```tsx
// NEVER use `any`
const courses: Course[] = MOCK_COURSES   // typed

// ALWAYS type component props
interface CourseCardProps {
  course: Course
  showInstructor?: boolean
  compact?: boolean
}

// Use Pick/Partial for partial types
type CourseSummary = Pick<Course, "id" | "title" | "slug" | "thumbnailUrl" | "price">

// Type event handlers
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
```

---

## Routing

```tsx
// Use next/link for navigation
import Link from "next/link"
<Link href={`/courses/${course.slug}`}>

// Simulate navigation with useRouter for buttons
"use client"
import { useRouter } from "next/navigation"
const router = useRouter()
router.push("/dashboard")
```

---

## Images

```tsx
// ALWAYS use next/image
import Image from "next/image"
<Image
  src={course.thumbnailUrl}
  alt={course.title}
  width={400}
  height={225}
  className="rounded-lg object-cover"
/>

// For Unsplash URLs in mock data — add to next.config.js:
// images: { domains: ["images.unsplash.com", "api.dicebear.com"] }
```

---

## Loading & Empty States

Every page and data-fetching component MUST have:

```tsx
// Loading skeleton (use Skeleton from shadcn)
function CourseCardSkeleton() {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-surface-container-high" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-container-high rounded w-3/4" />
        <div className="h-4 bg-surface-container-high rounded w-1/2" />
      </div>
    </div>
  )
}

// Empty state
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
      <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">menu_book</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}
```

---

## Responsive Behavior

| Element | Mobile | Desktop |
|---|---|---|
| Catalog sidebar | Bottom sheet drawer | Static left sidebar |
| Player sidebar | Floating drawer | Fixed right pane |
| Dashboard sidebar | Icon rail or hidden | Full 240px sidebar |
| Course grid | 1 col | 3 col |
| Enrollment card | Bottom fixed bar | Sticky right sidebar |

---

## globals.css — Required Additions

```css
/* globals.css */
body {
  font-family: 'Geist', sans-serif;
  background-color: #09090b;
  color: #fafafa;
}

/* Hero grid dot pattern */
.grid-bg {
  background-image: radial-gradient(#27272a 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Dotted connecting line (How it works section) */
.dotted-line {
  background-image: radial-gradient(circle, #52525b 1px, transparent 1px);
  background-size: 8px 8px;
}

/* Material Symbols size override utility */
.material-symbols-outlined {
  font-size: 20px; /* default, override with !text-* */
}
```

---

## What NOT to Do

- No database queries (Prisma / Supabase)
- No server actions that touch DB
- No real auth checks — treat all routes as accessible
- No API route calls (`/api/...`)
- No `useEffect` to fetch data — read directly from mock imports
- No hardcoded inline styles — use Tailwind classes only
- No `<img>` tags — always `next/image`
- No `<a>` tags for internal nav — always `next/link`
- No `console.log` left in final components
- No emojis in UI text unless explicitly in Stitch design

---

## Git Rules

- No `git commit`, `git push`, `git merge` without explicit instruction
- One commit per completed page or component group
- Commit format: `feat(ui): implement course catalog page`

---

## Phase Transition Note

When transitioning to Phase 3 (API integration):
- Replace `MOCK_*` imports with server action calls
- All component props and types stay the same — no refactoring needed
- Add `loading.tsx` and `error.tsx` alongside each page
- Swap mock functions (`formatPrice`, etc.) with the same utilities from `@/lib/utils`