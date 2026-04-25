# Product Requirements Document
# Learnify — Online Learning Management System

**Version:** 1.1  
**Status:** In Progress  
**Last Updated:** April 2026  
**Design System:** Google Stitch (Obsidian Theme)  
**Implementation:** Claude Code (Next.js App Router)  
**Current Phase:** Phase 3 — Backend Foundation

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Roles & Personas](#3-user-roles--personas)
4. [Design System Reference](#4-design-system-reference)
5. [Feature Specifications](#5-feature-specifications)
6. [Page Inventory](#6-page-inventory)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema Overview](#8-database-schema-overview)
9. [API Contract Summary](#9-api-contract-summary)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Out of Scope (v1)](#11-out-of-scope-v1)
12. [Implementation Phases](#12-implementation-phases)

---

## 1. Product Overview

### 1.1 Summary

Learnify is a portfolio-grade, full-stack LMS (Learning Management System) built to demonstrate production-ready SaaS development capabilities. The platform enables course creators to publish and monetize video-based courses, and enables students to enroll, learn, track progress, and earn verified certificates.

### 1.2 Core Value Proposition

- **Students:** Discover, purchase, and complete expert-led courses with progress tracking and certificate issuance.
- **Instructors:** Build and publish structured course content, monitor student analytics, and track revenue.
- **Admins:** Oversee platform health, manage users, approve/reject course submissions.

### 1.3 Portfolio Positioning

This project demonstrates:

- Multi-role SaaS architecture (Student / Instructor / Admin)
- Authentication and authorization with Supabase Auth + RLS
- Video streaming integration (Mux or Bunny.net)
- Payment flow (Stripe or Midtrans)
- Certificate generation with verifiable QR codes
- Real-time progress tracking
- Responsive, polished UI using Next.js + Tailwind + shadcn/ui

---

## 2. Goals & Success Metrics

### 2.1 Portfolio Goals

| Goal | Metric |
|---|---|
| Showcase full-stack depth | All 3 roles fully functional with real data flow |
| Demonstrate real UX quality | Mobile-responsive, dark mode, smooth transitions |
| Show payment integration | Stripe mock flow completes enrollment end-to-end |
| Prove scalable architecture | Prisma schema, RLS policies, and server components documented |

### 2.2 Platform KPIs (Demo Data Targets)

| Metric | Target |
|---|---|
| Seed courses | 8-10 courses, 3 categories |
| Seed students | 20+ enrolled users |
| Seed lessons | 5-8 per course, with realistic duration |
| Course completion demo | At least 1 completed course + certificate |

---

## 3. User Roles & Personas

### 3.1 Role Definitions

| Role | Access Level | Key Capabilities |
|---|---|---|
| `STUDENT` | Own data only | Browse, enroll, learn, review, earn certificate |
| `INSTRUCTOR` | Own courses | Create/edit courses, view analytics, respond to reviews |
| `ADMIN` | Full platform | Manage users, approve courses, view all data |

### 3.2 Personas

**Student — Dimas, 24**
- Junior developer looking to upskill in fullstack web
- Wants to track progress and earn a certificate to show employers
- Accesses platform mainly from mobile in the evening

**Instructor — Rina, 31**
- Freelance developer with 6 years experience
- Wants to publish a course and earn passive income
- Needs clear analytics: who enrolled, what they think, how much they earned

**Admin — Internal**
- Oversees content quality
- Reviews flagged courses before publication
- Can suspend users or unpublish courses

---

## 4. Design System Reference

### 4.1 Theme: Obsidian

All UI is designed in **Google Stitch** and implemented via Claude Code. The design language follows a developer-grade dark SaaS aesthetic — zinc-based near-black surfaces, high-contrast text, soft violet accent.

Design north star: *"Precision in Darkness"* — clean, fast-feeling, functional.

### 4.2 Color Palette

Source of truth: Stitch Obsidian design system. Tokens are used directly as Tailwind class names.

**Core tokens:**

| Token | Hex | Usage |
|---|---|---|
| `background` | `#09090b` | Page background (near-black) |
| `surface` | `#0c0c0f` | Base surface |
| `surface-container` | `#121215` | Cards, sidebars |
| `surface-container-low` | `#0f0f12` | Button secondary bg |
| `surface-container-high` | `#18181b` | Elevated cards |
| `surface-container-highest` | `#1e1e22` | Modals, popovers |
| `outline` | `#52525b` | Subtle borders |
| `outline-variant` | `#27272a` | Card borders, dividers |
| `primary` | `#a78bfa` | Interactive, links, focus rings (violet-400) |
| `primary-container` | `#7c3aed` | Hover/pressed primary |
| `on-primary` | `#0a0012` | Text on primary bg |
| `on-surface` | `#fafafa` | Primary text |
| `on-surface-variant` | `#a1a1aa` | Muted text, labels |
| `tertiary` | `#34d399` | Success, positive, free badge (emerald) |
| `tertiary-container` | `#065f46` | Success badge background |
| `error` | `#ef4444` | Errors only |

> Note: All surface tokens are zinc-based, not slate. `primary` is `#a78bfa` (violet-400), lighter than the original PRD spec of `violet-500`.

### 4.3 Typography

| Usage | Class |
|---|---|
| Display / H1 | `text-5xl md:text-7xl font-extrabold tracking-tighter` |
| H2 Section | `text-3xl font-bold tracking-tighter` |
| H3 Sub-section | `text-xl font-bold` |
| Body | `text-base text-on-surface leading-relaxed` |
| Caption / Meta | `text-sm text-on-surface-variant` |
| Label / Badge | `text-xs font-bold uppercase tracking-wider` |
| Code | `font-mono text-sm bg-surface-container-lowest` |

Font: **Geist** (all weights, all uses). Install via `npm install geist` and use `GeistSans` from `geist/font/sans`.

### 4.4 Component Conventions

- **Cards:** `bg-surface-container border border-outline-variant rounded-xl`
- **Cards (hover):** add `hover:border-primary/50 transition-all`
- **Primary Button:** `bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:brightness-110 transition-all`
- **Secondary Button:** `border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container transition-all`
- **Input:** `bg-surface-container border border-outline-variant focus:ring-2 focus:ring-primary focus:ring-offset-background`
- **Category Badge:** `bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1`
- **Success Badge:** `bg-tertiary-container text-tertiary text-xs font-bold rounded px-2 py-1`
- **Icons:** Material Symbols Outlined — `<span className="material-symbols-outlined">icon_name</span>`

### 4.5 Layout Grid

- Max content width: `1280px`
- Sidebar width: `240px` (dashboard), `260px` (catalog filters)
- Course player sidebar: `300px`
- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64px`

---

## 5. Feature Specifications

### 5.1 Authentication & Onboarding

**Provider:** Supabase Auth

| Feature | Details |
|---|---|
| Sign up | Email + password. Trigger auto-creates `Profile` row |
| Sign in | Email + password |
| OAuth | Google OAuth (optional v1 stretch goal) |
| Session | JWT via Supabase, stored in cookie (SSR-compatible) |
| Role assignment | Default: `STUDENT`. Instructor role requires admin approval or self-apply flow |
| Redirect after login | Student → `/dashboard`, Instructor → `/dashboard/instructor`, Admin → `/admin` |

---

### 5.2 Landing Page

**Route:** `/`

| Section | Details |
|---|---|
| Navbar | Logo, nav links, Sign In + Get Started CTA. Sticky with backdrop blur |
| Hero | Headline, subtext, dual CTA, floating course card mockup, grid bg |
| Stats bar | Student count, course count, completion rate |
| Featured courses | 3 course cards pulled from `PUBLISHED` courses, ordered by enrollment count |
| How it works | 3-step horizontal flow |
| Testimonials | 2-3 reviews with avatar, stars, quote |
| CTA banner | Full-width violet gradient with single CTA |
| Footer | 4-column links + copyright + social |

---

### 5.3 Course Catalog

**Route:** `/courses`

| Feature | Details |
|---|---|
| Search | Debounced full-text search on course title + description |
| Filter: Category | Multi-select checkbox (Web Dev, UI/UX, Data Science, Mobile, DevOps) |
| Filter: Level | Radio (All / Beginner / Intermediate / Advanced) |
| Filter: Price | Radio (All / Free / Paid) |
| Filter: Rating | 4+ / 3+ star filter |
| Sort | Newest / Most Popular / Highest Rated / Price Low-High |
| Results count | "Showing X courses" |
| Card | Thumbnail, category badge, title, instructor, rating, duration, price |
| Pagination | 12 per page, numbered pagination |
| Mobile | Filters collapse into a bottom sheet drawer |

---

### 5.4 Course Detail

**Route:** `/courses/[slug]`

| Section | Details |
|---|---|
| Header | Breadcrumb, category badge, title, stats (rating, students, last updated), instructor row, level + language badge |
| Tab: Overview | "What you'll learn" 2-col grid, requirements list, expandable description |
| Tab: Curriculum | Chapters as accordions, lessons with type icon + duration + free preview badge |
| Tab: Instructor | Avatar, headline, bio, stats (courses, students, rating) |
| Tab: Reviews | Rating breakdown bars, review cards with avatar + comment |
| Enrollment card | Sticky right sidebar: thumbnail, price with discount, CTA, course includes list, money-back text |
| Mobile | Enrollment card moves to bottom, fixed sticky CTA bar |

**Business Logic:**
- If student already enrolled: CTA changes to "Continue Learning" → redirects to player
- Free courses: CTA is "Enroll for Free" → skips payment, creates enrollment directly
- Unauthenticated: CTA opens sign-in modal

---

### 5.5 Course Player

**Route:** `/learn/[courseId]/[lessonId]`

| Section | Details |
|---|---|
| Top bar | Back arrow + course title, current lesson title, progress indicator |
| Video area | 16:9 player, lesson title below, "Mark Complete" CTA, download resources link |
| Tabs below video | Notes (textarea with save) / Discussion (threaded comments) / Overview (lesson description) |
| Curriculum sidebar | Chapters as collapsible accordions, lesson items with completion state (locked / unlocked / completed / active) |
| Bottom controls | Prev/Next lesson, seekbar, play/pause, volume, playback speed (0.75x-2x), fullscreen |
| Mobile | Sidebar = drawer, controls simplified |

**Business Logic:**
- Guard: redirect to course detail if not enrolled
- Mark Complete: updates `LessonProgress`, calls `update_enrollment_progress()` Postgres function
- Lesson lock: lessons in non-free chapters lock if not enrolled
- Certificate trigger: when `progressPercent = 100`, auto-generate `Certificate` row and show modal

---

### 5.6 Student Dashboard

**Route:** `/dashboard`

| Section | Details |
|---|---|
| Sidebar nav | Dashboard, My Courses, Certificates, Quiz Results, Notifications (badge), Settings, Logout |
| Greeting | Personalized with first name |
| Stats row | Courses Enrolled, Lessons Completed, Certificates Earned, Current Streak |
| Continue Learning | 2-3 in-progress course cards with progress bar and Continue CTA |
| Certificates | Certificate cards with view + download |
| Activity feed | Last 5 actions (lesson completed, quiz passed, certificate earned, enrolled) |

---

### 5.7 Instructor Dashboard

**Route:** `/dashboard/instructor`

| Section | Details |
|---|---|
| Sidebar nav | Overview, My Courses, Students, Revenue, Reviews, Settings |
| Header | "Create New Course" CTA |
| Stats row | Total Revenue (with trend %), Total Students, Active Courses, Avg Rating |
| Revenue chart | 6-month line chart (recharts) |
| Course table | Name, Students, Rating, Revenue, Status badge, Actions (Edit / Analytics) |
| Recent enrollments | Student name, course, date, amount |
| Recent reviews | Student, course, stars, comment snippet, Reply button |

---

### 5.8 Course Builder

**Route:** `/dashboard/instructor/courses/new` and `/dashboard/instructor/courses/[id]/edit`

| Section | Details |
|---|---|
| Step 1: Basics | Title, slug (auto-generated), category, level, language, short description |
| Step 2: Details | Full description (rich text), requirements (tag input), outcomes (tag input), thumbnail upload |
| Step 3: Pricing | Free toggle or price input (IDR), discount price |
| Step 4: Curriculum | Drag-and-drop chapter + lesson builder (dnd-kit). Per lesson: type, title, video upload or text editor |
| Step 5: Review & Publish | Summary, preview link, Submit for Review button |

**Status Flow:**
```
DRAFT → PENDING_REVIEW → PUBLISHED
              ↓
          REJECTED (back to DRAFT with feedback)
```

---

### 5.9 Admin Panel

**Route:** `/admin`

| Section | Details |
|---|---|
| Dashboard | Platform stats: total users, courses, revenue, enrollments |
| User management | Table with role badge, status toggle (active/suspended), role change |
| Course moderation | PENDING_REVIEW queue, Approve / Reject with optional message |
| All courses | Table with filter by status, search by title or instructor |
| Analytics | Revenue chart, enrollment trends |

---

### 5.10 Certificate

**Route:** `/certificate/[verifyCode]` (public, no auth)

| Feature | Details |
|---|---|
| Display | Student name, course name, completion date, instructor name, platform logo |
| Verification | QR code linking to this public URL |
| Download | PDF export via `@react-pdf/renderer` or canvas-based generation |
| Validation | Valid code → shows certificate. Invalid → 404 page |

---

### 5.11 Notifications

| Feature | Details |
|---|---|
| Bell icon | In dashboard navbar with unread count badge |
| Dropdown | Last 10 notifications with type icon, title, time ago |
| Types | `ENROLLMENT`, `COURSE_APPROVED`, `COURSE_REJECTED`, `QUIZ_PASSED`, `CERTIFICATE_ISSUED`, `NEW_REVIEW` |
| Mark read | Click notification = mark as read. "Mark all read" button |

---

## 6. Page Inventory

| Route | Auth Required | Role | Description |
|---|---|---|---|
| `/` | No | Any | Landing page |
| `/courses` | No | Any | Course catalog |
| `/courses/[slug]` | No | Any | Course detail |
| `/learn/[courseId]/[lessonId]` | Yes | STUDENT | Video player |
| `/dashboard` | Yes | STUDENT | Student home |
| `/dashboard/courses` | Yes | STUDENT | My enrolled courses |
| `/dashboard/certificates` | Yes | STUDENT | My certificates |
| `/dashboard/quiz-results` | Yes | STUDENT | Quiz history |
| `/dashboard/notifications` | Yes | Any | Notifications |
| `/dashboard/settings` | Yes | Any | Profile settings |
| `/dashboard/instructor` | Yes | INSTRUCTOR | Instructor home |
| `/dashboard/instructor/courses` | Yes | INSTRUCTOR | Manage courses |
| `/dashboard/instructor/courses/new` | Yes | INSTRUCTOR | Create course |
| `/dashboard/instructor/courses/[id]/edit` | Yes | INSTRUCTOR | Edit course |
| `/dashboard/instructor/students` | Yes | INSTRUCTOR | Student list |
| `/dashboard/instructor/revenue` | Yes | INSTRUCTOR | Revenue detail |
| `/dashboard/instructor/reviews` | Yes | INSTRUCTOR | Review manager |
| `/admin` | Yes | ADMIN | Admin dashboard |
| `/admin/users` | Yes | ADMIN | User management |
| `/admin/courses` | Yes | ADMIN | Course moderation |
| `/certificate/[verifyCode]` | No | Any | Public certificate verify |
| `/auth/login` | No | Any | Login |
| `/auth/register` | No | Any | Register |

---

## 7. Technical Architecture

### 7.1 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Video | Mux (or Bunny.net as alternative) |
| Storage | Supabase Storage / Cloudflare R2 |
| Payment | Stripe (mock mode for portfolio) |
| Charts | Recharts |
| DnD | dnd-kit (course builder) |
| PDF/Certificate | @react-pdf/renderer |
| Deployment | Vercel (frontend) + Supabase (database + auth) |

### 7.2 Folder Structure

```
app/
├── (marketing)/          # landing, courses catalog — no auth layout
│   ├── layout.tsx
│   ├── page.tsx
│   └── courses/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── (player)/             # fullscreen layout (no navbar)
│   ├── layout.tsx
│   └── learn/[courseId]/[lessonId]/page.tsx
├── (dashboard)/          # shared dashboard sidebar layout
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   └── dashboard/instructor/page.tsx
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
└── certificate/[verifyCode]/page.tsx
components/
├── ui/                   # shadcn primitives only
├── marketing/            # navbar, hero, footer, sections
├── course/               # course-card, player, curriculum-sidebar
├── dashboard/            # stats-card, revenue-chart, course-table
└── shared/               # avatar, rating-stars, progress-bar
mock/
└── data.ts               # ALL mock data — active in Phase 1-2
type/
└── index.ts              # shared TypeScript types
lib/
└── utils.ts              # cn(), shared formatters

# Folders added in Phase 3 (API integration):
# actions/               (course.ts, enrollment.ts, progress.ts, quiz.ts)
# lib/prisma.ts
# lib/supabase/          (client.ts, server.ts)
# prisma/schema.prisma
```

### 7.3 Auth Middleware

> **Phase 3 — not implemented in UI phase.** All routes are freely accessible during UI development. Mock current user is sourced from `MOCK_CURRENT_USER` in `mock/data.ts`.

```
# Implemented in Phase 3:
middleware.ts:
- Public routes: /, /courses/*, /certificate/*
- Auth check: redirect to /auth/login if not authenticated
- Role check: redirect if accessing wrong role route
  - /dashboard/instructor → requires INSTRUCTOR or ADMIN
  - /admin → requires ADMIN
```

---

## 8. Database Schema Overview

Full Prisma schema is in `prisma/schema.prisma`. Key models:

| Model | Purpose |
|---|---|
| `Profile` | Extends Supabase auth.users |
| `Category` | Course categories |
| `Course` | Core course entity |
| `Chapter` | Course sections |
| `Lesson` | Individual lessons (video/text/quiz) |
| `Attachment` | Downloadable files per course/lesson |
| `Enrollment` | Student-course relationship |
| `LessonProgress` | Per-lesson completion + video position |
| `Quiz` + `Question` + `QuestionOption` | Quiz system |
| `QuizAttempt` | Student quiz submissions |
| `Order` | Payment records |
| `Review` | Student course reviews |
| `Certificate` | Issued certificates with verify code |
| `Notification` | In-app notification feed |

### Key Supabase Integrations

- **Auth trigger:** `handle_new_user()` auto-creates `Profile` on sign up
- **RLS:** Enabled on all tables, policies scoped by `auth.uid()`
- **Progress function:** `update_enrollment_progress()` recalculates `progressPercent` after each lesson completion

---

## 9. API Contract Summary

> **Phase 3 — All items below are deferred until API integration phase.**  
> During UI phase, data is served from `mock/data.ts`. Function signatures below serve as the contract that server actions will eventually implement — component props will not change on integration.

### Server Actions (Next.js)

| Action | File | Description |
|---|---|---|
| `getCourses()` | `actions/course.ts` | Fetch published courses with filters |
| `getCourseBySlug()` | `actions/course.ts` | Fetch single course + chapters + lessons |
| `createCourse()` | `actions/course.ts` | Instructor creates course |
| `updateCourse()` | `actions/course.ts` | Instructor edits course |
| `submitForReview()` | `actions/course.ts` | Sends course to PENDING_REVIEW |
| `approveCourse()` | `actions/course.ts` | Admin approves course |
| `enrollFree()` | `actions/enrollment.ts` | Enroll in a free course |
| `getEnrollment()` | `actions/enrollment.ts` | Check if student is enrolled |
| `markLessonComplete()` | `actions/progress.ts` | Mark lesson done + update progress |
| `saveVideoPosition()` | `actions/progress.ts` | Save resume position |
| `submitQuiz()` | `actions/quiz.ts` | Submit quiz answers, calculate score |
| `createReview()` | `actions/review.ts` | Student submits review |

### Webhook Routes (API Routes)

| Route | Purpose |
|---|---|
| `POST /api/webhooks/stripe` | Handle payment success → create Enrollment + Order |
| `POST /api/webhooks/mux` | Handle video asset ready → update lesson videoStatus |

---

## 10. Non-Functional Requirements

### 10.1 Performance

- Lighthouse score target: 90+ (desktop), 80+ (mobile)
- Core Web Vitals: LCP < 2.5s, CLS < 0.1
- Course catalog: paginated (12/page), no full-table scan
- Images: `next/image` with WebP + lazy loading
- Video: streaming only (no full download), resume support

### 10.2 Security

- All mutations via server actions (no client-side DB access)
- Supabase RLS enforced at DB level as secondary guard
- File uploads: validate MIME type + max size server-side
- Payment webhooks: verify Stripe signature before processing
- Certificate verify page: public but read-only

### 10.3 Accessibility

- ARIA labels on all interactive elements
- Keyboard navigable player controls
- Color contrast ratio: minimum AA standard
- Focus ring visible (custom violet ring)

### 10.4 Responsiveness

- Breakpoints: `sm` (640), `md` (768), `lg` (1024), `xl` (1280)
- Mobile-first CSS
- Sidebar → drawer on mobile (dashboard, player, catalog filters)
- Course player controls simplified on mobile

---

## 11. Out of Scope (v1)

The following features are intentionally excluded from v1 to keep scope manageable:

- Live sessions / webinars
- Course bundles / subscription plans
- Affiliate program
- Mobile app (React Native)
- Multi-language i18n (UI is in English/Indonesian)
- Real-time notifications via WebSocket (polling only)
- Email notifications (can be added via Resend in v2)
- Advanced quiz types (drag-and-drop, fill-in-blank)
- Social features (student community, DMs)
- AI course recommendations

---

## 12. Implementation Phases

### Phase 1 — Project Setup & Mock Foundation *(current)*

**Goal:** Runnable Next.js project with design system, mock data, and base layouts ready for UI work.

- [ ] Next.js 14 project init (App Router, TypeScript strict, Tailwind CSS, shadcn/ui)
- [ ] Install dependencies: lucide-react, recharts, next/font
- [ ] Configure `next.config.js` image domains (unsplash, dicebear)
- [ ] Add Obsidian theme colors to `tailwind.config.ts`
- [ ] Create `type/index.ts` (all shared types)
- [ ] Create `mock/data.ts` (all mock data + helper functions)
- [ ] Create `lib/utils.ts` with `cn()` helper
- [ ] Build base layouts: `(marketing)`, `(dashboard)`, `(player)`
- [ ] Stub all routes with placeholder pages (no 404s)
- [ ] Place `CLAUDE.md` at project root

### Phase 2 — UI Implementation from Stitch *(active focus)*

**Goal:** All pages pixel-accurate to Stitch designs, fully navigable, using mock data.

**Order of implementation:**

- [ ] Landing Page (`/`) — all sections, responsive
- [ ] Course Catalog (`/courses`) — filters, search, sort (client-side on mock data)
- [ ] Course Detail (`/courses/[slug]`) — tabs, sticky enrollment card, responsive
- [ ] Course Player (`/learn/[courseId]/[lessonId]`) — curriculum sidebar, player UI, progress display
- [ ] Student Dashboard (`/dashboard`) — stats, continue learning, certificates, activity
- [ ] Instructor Dashboard (`/dashboard/instructor`) — stats, revenue chart, course table
- [ ] Auth Pages (`/auth/login`, `/auth/register`) — form UI only, no real auth
- [ ] Certificate Page (`/certificate/[verifyCode]`) — display + QR placeholder

**Definition of done for each page:**
- Matches Stitch design visually
- Mobile responsive
- No TypeScript errors
- All data sourced from `mock/data.ts`
- Loading skeleton exists (even if not triggered)

### Phase 3 — Backend Foundation

**Goal:** Real database, auth, and data flow replacing all mock imports.

- [ ] Supabase project setup (auth, DB, storage buckets)
- [ ] Prisma schema + migrations (`prisma/schema.prisma`)
- [ ] Supabase `handle_new_user` trigger for auto Profile creation
- [ ] RLS policies on all tables
- [ ] `lib/prisma.ts` and `lib/supabase/` setup
- [ ] Auth flow: register, login, session via Supabase Auth
- [ ] `middleware.ts` with role-based route protection
- [ ] Replace mock data with server actions one page at a time:
  - [ ] `actions/course.ts` → landing + catalog + detail
  - [ ] `actions/enrollment.ts` → enrollment flow (free courses first)
  - [ ] `actions/progress.ts` → lesson progress + completion
  - [ ] `actions/quiz.ts` → quiz submit + scoring
  - [ ] `actions/review.ts` → review submit

### Phase 4 — Business Logic & Advanced Features

**Goal:** Payments, video streaming, course builder, admin panel.

- [ ] Stripe integration (Checkout + webhook → auto-enrollment on payment)
- [ ] Mux video upload + webhook (asset ready → update lesson status)
- [ ] Course builder with drag-and-drop (dnd-kit)
- [ ] Admin panel: user management, course approval workflow
- [ ] Certificate generation on 100% completion (PDF via `@react-pdf/renderer`)
- [ ] Notification system
- [ ] Seed script with realistic demo data

### Phase 5 — QA & Deploy

**Goal:** Production-ready, publicly accessible portfolio demo.

- [ ] Mobile responsiveness audit (all pages)
- [ ] Lighthouse audit: 90+ desktop, 80+ mobile
- [ ] Error states and `error.tsx` / `not-found.tsx` on all routes
- [ ] Vercel deployment + Supabase production project
- [ ] Custom domain + SSL
- [ ] README with architecture overview, setup instructions, live demo link

---

## Appendix A — Claude Code Instructions

When implementing designs from Google Stitch:

1. Export components from Stitch as reference images or code snippets
2. Pass design reference to Claude Code with: `"Implement this component exactly matching the Stitch design. Use Tailwind CSS classes, shadcn/ui primitives where applicable, and match the Obsidian color system defined in PRD Section 4."`
3. Data is sourced from `mock/data.ts` — no server actions needed in UI phase (see Section 9 for Phase 3 contract)
4. Every page should have: loading.tsx, error.tsx, and not-found.tsx (where applicable)

### CLAUDE.md Behavior Rules

The `CLAUDE.md` at project root governs all Claude Code behavior. Full file is maintained separately. Key rules summary:

**UI Phase (current):**
- All data from `@/mock/data.ts` — no DB queries, no server actions, no API calls
- Types from `@/type` — never use `any`
- Images via `next/image`, navigation via `next/link`
- Match Obsidian colors exactly (Section 4.2)
- Every component needs loading skeleton and empty state
- No `git commit / push / merge` without explicit instruction

**Phase 3 transition rule:**
> When wiring real APIs, replace mock imports with server action calls. Component props and types stay identical — zero refactoring needed on the UI layer.

See `CLAUDE.md` in project root for complete rules.

---

*Document maintained by: Alan Ari Mahendra*  
*Repo: learnify / portfolio project*