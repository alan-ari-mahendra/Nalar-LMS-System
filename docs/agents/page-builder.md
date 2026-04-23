# Page Builder Agent — Learnify LMS

## Role
Implement complete Next.js pages using existing components and mock data.
One page per session. Never build new components — use what exists.

## Before Every Session
Read ALL of these:
1. CLAUDE.md
2. type/index.ts
3. mock/data.ts
4. components/ — audit what's available
5. docs/stitch-design/[target-page]/code.html — source of truth for layout
6. docs/stitch-design/[target-page]/screen.png — visual reference

## Critical: Read code.html Before Any Code
The Stitch HTML export is the source of truth for:
- Exact layout structure and nesting
- Color token class names
- Text copy and labels
- Transition and animation classes
- Spacing values

## Page Queue (implement in this order)

### 1. Landing Page
File: app/(marketing)/page.tsx
Stitch: docs/stitch-design/learnify_landing_page/
Sections: Hero, Stats Bar, Featured Courses, How It Works, Testimonials, CTA Banner
Components: Navbar, Footer, CourseCard (x3), RatingStars
Mock data: MOCK_COURSES.slice(0,3), MOCK_TESTIMONIALS
Layout wrapper: (marketing)/layout.tsx handles Navbar + Footer

### 2. Course Catalog
File: app/(marketing)/courses/page.tsx
Stitch: docs/stitch-design/explore_courses_learnify/
Features: search bar, filter sidebar, sort dropdown, results count, course grid, pagination UI
Components: CourseCard, CourseCardSkeleton, CourseBadge
Mock data: MOCK_COURSES, MOCK_CATEGORIES
Note: all filtering via useState client-side — "use client" required
      filter sidebar → Sheet drawer on mobile

### 3. Course Detail
File: app/(marketing)/courses/[slug]/page.tsx
Stitch: docs/stitch-design/course_detail_mastering_react_next.js_14/
Sections: breadcrumb, header, shadcn Tabs (Overview/Curriculum/Instructor/Reviews), sticky enrollment card
Components: CourseBadge, RatingStars, Avatar, ProgressBar
Mock data: MOCK_COURSE_DETAIL (always, ignore slug)
Note: sticky enrollment card = hidden on mobile, replaced by fixed bottom bar

### 4. Video Player
File: app/(player)/learn/[courseId]/[lessonId]/page.tsx
Stitch: docs/stitch-design/video_player_mastering_react_next.js_14/
Sections: top bar, video area (black div + play button), tabs, curriculum sidebar, bottom controls
Components: Avatar, ProgressBar, CourseBadge
Mock data: MOCK_COURSE_DETAIL, MOCK_LESSON_PROGRESS, MOCK_CURRENT_LESSON
Note: no real video player — UI shell only
      curriculum sidebar → Sheet on mobile
      "use client" required for sidebar toggle and tab state

### 5. Student Dashboard
File: app/(dashboard)/dashboard/page.tsx
Stitch: docs/stitch-design/student_dashboard_learnify/
Sections: greeting, stats row, continue learning cards, certificates, activity feed
Components: StatsCard, SidebarNav, CourseCard (compact), ProgressBar, ActivityFeedItem, Avatar
Mock data: MOCK_CURRENT_USER, MOCK_STUDENT_STATS, MOCK_ENROLLMENTS, MOCK_CERTIFICATES, MOCK_ACTIVITY

### 6. Instructor Dashboard
File: app/(dashboard)/dashboard/instructor/page.tsx
Stitch: docs/stitch-design/instructor_dashboard_learnify/
Sections: header + CTA, stats row, revenue chart, course performance table, recent enrollments
Components: StatsCard, SidebarNav, RevenueChart, CourseBadge, Avatar
Mock data: MOCK_INSTRUCTOR_STATS, MOCK_COURSE_PERFORMANCE, MOCK_RECENT_ENROLLMENTS

### 7. Auth Pages
Files: app/auth/login/page.tsx + register/page.tsx
No Stitch ref — match design system
Login: email + password + CTA + link to register
Register: name + email + password + role radio (Student / Instructor) + CTA

### 8. Certificate Page
File: app/certificate/[verifyCode]/page.tsx
Layout: centered card — course name, student name, issue date, instructor name,
        platform logo, QR placeholder (div with border), Download button
Mock data: MOCK_CERTIFICATES[0]

## Per-Page Checklist
Before marking a page done:
- [ ] Matches Stitch screen.png visually
- [ ] Zero TypeScript errors (npx tsc --noEmit)
- [ ] Zero build errors (npm run build)  
- [ ] No slate-* classes
- [ ] No lucide-react imports
- [ ] No hardcoded data — all from mock/data.ts
- [ ] Mobile responsive (sidebar/filters collapse correctly)
- [ ] Loading skeleton present (even if not triggered)

## When a Component is Missing
Do NOT create it inline.
Report: "Component X is missing. Needs to be built by Component Library Agent first."
Then wait for instruction.

## Constraints
- Never create new components — pages only
- Never use `any` type
- Deviations from Stitch design must be commented in code with reason
- "use client" only when interactivity requires it — prefer server components
