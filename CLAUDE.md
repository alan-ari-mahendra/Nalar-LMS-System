# CLAUDE.md — Learnify Backend Phase

> This is the CLAUDE.md governing Claude Code behavior for the **Backend Phase** of Learnify.
> Phase 3 active: Server actions and real database queries. Mock data being phased out.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript — strict mode |
| Styling | Tailwind CSS 4 (tokens via @theme in globals.css) |
| Icons | Material Symbols Outlined (npm: material-symbols) |
| Charts | recharts |
| Fonts | geist npm package (GeistSans, GeistMono) |
| Images | next/image |
| Auth | Custom JWT (lib/auth/) — NOT NextAuth, NOT Supabase |
| Database | Prisma 7.8 + Neon PostgreSQL |
| Validation | Zod |
| Password | bcryptjs (rounds=12) |

---

## Current State
- Phase 1-3a: Complete (UI + Auth + RBAC)
- Phase 3b onwards: In progress per PRD v2 (docs/learnify-prd-v2.md)
- Next: Phase A (auth completion — password reset + email verify)

---

## Design System — Obsidian Theme

Source of truth: `docs/stitch-design/obsidian/DESIGN.md` + HTML exports.

### Tailwind CSS 4 — Token Source

Tailwind CSS 4 — tokens live in app/globals.css via @theme block.
Do NOT use tailwind.config.ts for custom tokens — it is not used in v4.
Token format: --color-[name]: value → generates bg-[name], text-[name], border-[name].
Full @theme block is in app/globals.css.

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

## Data Rules

src/mock/data.ts is DELETED. Do not reference or recreate it.
All data comes from the database via server actions in lib/actions/.

Server action pattern:
  - All actions in lib/actions/[domain].ts
  - All actions use Zod validation on inputs
  - All mutations use requireRole() or requireAuth() from lib/auth/guards.ts
  - Never import prisma directly in app/ pages or components
  - Prisma client: import from lib/db.ts only

Payment is mock only:
  - No real payment SDK (no Midtrans, no Stripe)
  - Simulate flow: checkout page → confirmMockPayment() → Order COMPLETED → Enrollment created
  - Order model in DB records all transactions

File uploads are mock only (Phase B):
  - app/api/upload/route.ts returns placeholder URL — no real storage
  - Upload UI shows local preview via URL.createObjectURL()
  - DB stores placeholder URL strings
  - TODO comments mark where real integration goes (UploadThing, S3)

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

- No direct prisma import in app/ — use lib/actions/ only
- No mock data imports — src/mock/data.ts is deleted
- No `any` TypeScript type — use proper types or `unknown`
- No `<img>` tags — always `next/image`
- No `<a>` tags for internal nav — always `next/link`
- No `console.log` left in components
- No hardcoded inline styles — Tailwind classes only
- No slate-* color classes — use Obsidian tokens only
- No lucide-react — Material Symbols only
- No OAuth implementation — not in scope
- No real file storage — mock upload only (see Phase B)
- No tailwind.config.ts theme customization — use globals.css @theme

---

## Git Rules

- No `git commit`, `git push`, `git merge` without explicit instruction
- One commit per completed page or component group
- Commit format: `feat(ui): implement course catalog page`
- **Never** add `Co-Authored-By` or any AI attribution lines in commit messages
- Never add 'Co-Authored-By' or any AI attribution in commit messages

---

## Adding New Features (PRD v2)

When implementing any PRD v2 phase:
1. DB models first — run database-design agent, migrate, generate
2. Server actions second — lib/actions/[domain].ts with Zod + guards
3. UI last — wire pages to actions, add loading.tsx + error.tsx
Never build UI before the schema and actions are ready.
