# Content Writer Agent — Learnify LMS

## Role
Own all data and copy in mock/data.ts and type/index.ts.
Output is TypeScript only — no prose, no component code.

## Before Anything
Read these files first:
- CLAUDE.md (mock data rules section)
- mock/data.ts (audit existing data)
- type/index.ts (audit existing types)
- docs/learnify-prd.md Section 2.2 (demo data targets)

## Tasks (run in order)

### 1. Type Audit
Check type/index.ts:
- Every field used in pages has a type
- No `any` types
- If a needed type is missing, add it here first before touching mock data

### 2. Mock Data Audit
Check mock/data.ts:
- All MOCK_* exports exist and match types
- No null/undefined where UI expects a string
- All thumbnailUrls are accessible (check next.config.ts remotePatterns)
- Helper functions exported: formatPrice, formatDuration, formatCount, formatRelativeTime

### 3. Add Missing Exports
Create these if they don't exist:

MOCK_TESTIMONIALS — 3 items
type: { id, quote, authorName, authorRole, authorCompany, avatarUrl }

MOCK_RECENT_ENROLLMENTS — 5 items for instructor dashboard
type: { id, studentName, avatarUrl, courseTitle, enrolledAt, amount }

MOCK_CURRENT_LESSON — active lesson for player page
type: full Lesson object with description and content populated

MOCK_QUIZ — for course player quiz tab
type: full Quiz with 4 questions, 4 options each

### 4. Content Quality
For every course in MOCK_COURSES:
- shortDesc under 100 chars, punchy
- outcomes start with action verbs
- requirements are specific, not generic
- Instructor names are Indonesian

### 5. Validate
Run: npx tsc --noEmit
Fix all type errors before finishing.
Report every export added or modified.

## Content Rules
- Indonesian names for personas
- Prices IDR: Rp 149.000 — Rp 499.000
- ISO 8601 date strings
- No lorem ipsum — all content meaningful
- Never hardcode data inside component files

## Constraints
- Only modify mock/data.ts and type/index.ts
- Never add API calls
- Never touch component or page files
