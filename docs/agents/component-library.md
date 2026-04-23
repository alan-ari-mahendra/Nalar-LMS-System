# Component Library Agent — Learnify LMS

## Role
Build all reusable shared components before any pages are implemented.
Page Builder Agent depends on your output — completeness and correctness matter.

## Before Anything
Read these files first:
- CLAUDE.md (design tokens, component patterns, icon usage)
- type/index.ts
- mock/data.ts
- docs/stitch-design/*/screen.png (all 6 screens)

## Non-Negotiable Rules
- Icons: Material Symbols ONLY — `<span className="material-symbols-outlined">name</span>`
- Colors: Obsidian tokens ONLY — never slate-*, never arbitrary hex
- Types: all props typed from type/index.ts — never `any`
- Data: never fetch — accept via props only

## Components to Build

### components/shared/RatingStars.tsx
props: { rating: number; count?: number; size?: "sm" | "md" }
- Material Symbols star icon
- Filled: text-primary, empty: text-outline
- Shows count if provided

### components/shared/ProgressBar.tsx
props: { value: number; size?: "sm" | "md"; showLabel?: boolean }
- Fill: bg-primary, track: bg-surface-container-highest

### components/shared/CourseBadge.tsx
props: { label: string; variant: "category" | "level" | "free" | "status" }
- category: bg-surface-container-highest text-on-surface-variant
- free: bg-tertiary-container text-tertiary
- status maps: PUBLISHED=tertiary, DRAFT=amber-500, PENDING=primary

### components/shared/Avatar.tsx
props: { src?: string | null; name: string; size?: "sm" | "md" | "lg" }
- Falls back to initials when no src
- sm=w-8 h-8, md=w-10 h-10, lg=w-14 h-14

### components/shared/NotificationBell.tsx
props: { count: number; onClick?: () => void }
- Material Symbols notifications icon
- Badge capped at "9+"

### components/course/CourseCard.tsx
props: { course: Course; compact?: boolean; showProgress?: boolean; progress?: number }
- Reference: Featured Courses section in learnify_landing_page/screen.png
- Default: thumbnail (16:9) + category badge overlay + title + instructor + rating + price
- compact: horizontal layout, thumbnail left
- hover: border-primary/50, title color transition
- showProgress: renders ProgressBar below thumbnail

### components/course/CourseCardSkeleton.tsx
- Matches CourseCard dimensions with animate-pulse blocks
- bg-surface-container-high for placeholder shapes

### components/dashboard/StatsCard.tsx
props: { title: string; value: string | number; icon: string; trend?: number; suffix?: string }
- icon = Material Symbol name string
- trend positive: text-tertiary ↑, negative: text-error ↓

### components/dashboard/SidebarNav.tsx
props: { role: "STUDENT" | "INSTRUCTOR" | "ADMIN"; activePath: string }
- STUDENT links: Dashboard, My Courses, Certificates, Quiz Results, Notifications, Settings
- INSTRUCTOR links: Overview, My Courses, Students, Revenue, Reviews, Settings
- Active: bg-surface-container-high border-l-2 border-primary text-on-surface
- Inactive: text-on-surface-variant hover:bg-surface-container

### components/dashboard/RevenueChart.tsx
props: { data: MonthlyRevenue[] }
- Recharts LineChart
- Line: stroke="#a78bfa"
- CartesianGrid: stroke="#27272a"
- Tooltip: bg-surface-container-high

### components/dashboard/ActivityFeedItem.tsx
props: { item: ActivityItem }
- Icon per type: LESSON_COMPLETED=check_circle, CERTIFICATE_EARNED=workspace_premium,
  QUIZ_PASSED=quiz, ENROLLED=bookmark_add
- Message + formatRelativeTime timestamp

### components/marketing/Navbar.tsx
- Logo: bolt icon + "Learnify" text
- Links: Courses, Paths, Mentors, Enterprise
- Right: Log In ghost + Get Started primary
- fixed top, backdrop-blur-md, border-b border-outline-variant bg-zinc-950/80
- Reference: top of learnify_landing_page/screen.png

### components/marketing/Footer.tsx
- 4 columns: Platform, Community, Resources, legal links
- Bottom bar: copyright + Material Symbols social icons
- Reference: bottom of learnify_landing_page/screen.png

## After Each Component
1. npx tsc --noEmit — zero errors required
2. Named export AND default export
3. No hardcoded data — props only
4. Document props with JSDoc if non-obvious

## Constraints
- Do not build any pages
- Do not import from app/
- Allowed state: only local UI state (open/closed, hover, active tab)
