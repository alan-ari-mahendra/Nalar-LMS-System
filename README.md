# Learnify — Online Learning Management System

A portfolio-grade, full-stack LMS built to demonstrate production-ready SaaS development. Course creators can publish and monetize video-based courses, students can enroll, learn, track progress, and earn verified certificates.

**Current Phase:** Phase 2 — UI with Mock Data

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | Material Symbols Outlined |
| Charts | Recharts |
| Fonts | Geist (via next/font) |
| Images | next/image |

## Design System

**Obsidian Theme** — dark SaaS aesthetic with zinc-based surfaces and violet accent (`#a78bfa`).

- Source of truth: `docs/stitch-design/` (Google Stitch exports)
- Design doc: `docs/stitch-design/obsidian/DESIGN.md`
- All colors defined as Tailwind v4 `@theme` tokens in `app/globals.css`

## Pages

| Route | Description | Status |
|---|---|---|
| `/` | Landing page | Done |
| `/courses` | Course catalog with filters, search, sort, pagination | Done |
| `/courses/[slug]` | Course detail with tabs, curriculum accordion, enrollment card | Done |
| `/learn/[courseId]/[lessonId]` | Video player with curriculum sidebar and controls | Done |
| `/dashboard` | Student dashboard — stats, continue learning, certificates, activity | Done |
| `/dashboard/instructor` | Instructor dashboard — revenue chart, course table, enrollments | Done |
| `/auth/login` | Login form | Done |
| `/auth/register` | Registration with role selection | Done |
| `/certificate/[verifyCode]` | Public certificate verification | Done |

## Project Structure

```
app/
├── (marketing)/          # Landing, catalog, course detail
├── (player)/             # Video player (fullscreen layout)
├── (dashboard)/          # Student + instructor dashboards
├── auth/                 # Login, register
└── certificate/          # Public certificate page
components/
├── shared/               # Avatar, RatingStars, ProgressBar, CourseBadge, NotificationBell
├── course/               # CourseCard, CourseCardSkeleton
├── dashboard/            # StatsCard, SidebarNav, RevenueChart, ActivityFeedItem
└── marketing/            # Navbar, Footer
mock/
└── data.ts               # All mock data + helper functions
type/
└── index.ts              # Shared TypeScript types
docs/
├── learnify-prd.md       # Product Requirements Document
├── agents/               # Agent definitions (orchestrator, content-writer, etc.)
└── stitch-design/        # Google Stitch design exports (HTML + PNG)
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Type check
npx tsc --noEmit

# Build
pnpm build
```

Open [http://localhost:3000](http://localhost:3000).

## Mock Data

All data is sourced from `mock/data.ts` during Phase 2. No database, no API calls, no auth checks. Import paths:

```tsx
import { MOCK_COURSES, formatPrice } from "@/mock/data"
import type { Course } from "@/type"
```

## Implementation Phases

- [x] **Phase 1** — Project setup, design system, mock data foundation
- [x] **Phase 2** — UI implementation from Stitch designs (current)
- [ ] **Phase 3** — Backend (Supabase Auth, Prisma, server actions)
- [ ] **Phase 4** — Business logic (payments, video, course builder, admin)
- [ ] **Phase 5** — QA, deploy, Lighthouse audit

## Author

Alan Ari Mahendra
