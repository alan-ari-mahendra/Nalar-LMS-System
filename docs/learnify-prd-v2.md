# Learnify — PRD v2 (Continuation)

> Continuation PRD covering everything not yet implemented after Phase 1–3a.
> Each phase is independently shippable. Order: blockers first, user-value second, polish last.

---

## Out of Scope (All Phases)

OAuth (Google/GitHub), Cart, LiveSession, Chat/Messaging, Badge/Achievement, LearningPath, SupportTicket, i18n, 2FA, Redis, search engine (Algolia/Meilisearch), CertificateTemplate, real file/video upload (UploadThing/S3/Mux/Cloudinary), real payment SDK (Midtrans/Stripe/webhooks).

---

## Phase A — Auth Completion

**Objective:** Close auth-flow gaps so real users can recover accounts and verify email.

### In Scope
- Forgot password page (`/auth/forgot`) — email input, generate `PasswordResetToken`, send reset email via Resend.
- Reset password page (`/auth/reset?token=`) — token verify, new password form, update Credential hash, invalidate token.
- Email verification on register — generate `VerificationToken`, send verify email.
- Verify page (`/auth/verify?token=`) — verify token, set `User.emailVerified = true`, invalidate token.
- Resend verification email action (rate-limited at action level — simple cooldown via lastSentAt).
- Resend SDK + email templates (HTML + plaintext) for: verify, password-reset.
- Env vars: `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`.

### Out of Scope
OAuth, 2FA, remember-me, IP rate limiting, magic link login.

### DB Models (modify only — already exist)
- `VerificationToken` — already in schema. Confirm fields: `token`, `userId`, `expiresAt`.
- `PasswordResetToken` — already in schema. Confirm fields: `token`, `userId`, `expiresAt`, `usedAt`.
- `User.emailVerified` — already exists.

### New Routes/Files
- `app/auth/forgot/page.tsx` — S
- `app/auth/reset/page.tsx` — S
- `app/auth/verify/page.tsx` — S
- `lib/auth/actions.ts` — add `requestPasswordReset`, `resetPassword`, `verifyEmail`, `resendVerification` — M
- `lib/email/client.ts` — Resend wrapper — S
- `lib/email/templates/verify.tsx` — S
- `lib/email/templates/password-reset.tsx` — S
- Update `lib/auth/actions.ts:register` to dispatch verify email — S

### Dependencies
None. Independent first phase.

### Complexity Total
M

---

## Phase B — File & Media (Mock + Future-Ready)

**Objective:** Replace placeholder UI with mock upload flows + real video player. Architecture ready for real storage swap later.

### In Scope
- Thumbnail uploader component — drag-and-drop, accepts image, local preview via `URL.createObjectURL()`, no server storage.
- Video uploader component — file picker, simulated progress bar (3s animation), "Processing → Ready" state, stores placeholder URL.
- Attachment uploader component — file picker, shows filename + size, stores placeholder URL.
- API stub: `app/api/upload/route.ts` — returns `{ url: "https://placeholder.learnify.dev/[filename]" }`. TODO comments for UploadThing/S3 swap.
- Real `VideoPlayer` component — HTML5 `<video>` element, controls (play/pause, seek, volume, fullscreen, playback speed), uses free sample MP4 for demo. Calls `updateWatchProgress()` server action on `timeupdate`.

### Out of Scope
UploadThing, S3, Mux, Cloudinary, real transcoding, HLS/DASH streaming, captions/transcripts.

### DB Models
None new. Uses existing `Course.thumbnailUrl`, `Lesson.videoUrl`, `Attachment.url` (all string columns).

### New Routes/Files
- `app/api/upload/route.ts` — S
- `components/upload/ThumbnailUploader.tsx` — M
- `components/upload/VideoUploader.tsx` — M
- `components/upload/AttachmentUploader.tsx` — S
- `components/player/VideoPlayer.tsx` — replace stub — M
- `lib/actions/progress.ts` — confirm `updateWatchProgress(lessonId, seconds)` exists or add — S

### Dependencies
None. Player work uses existing progress action.

### Complexity Total
M

---

## Phase C — Course Builder UI

**Objective:** Instructors build courses end-to-end without leaving the UI.

### In Scope
- Drag-and-drop chapter/lesson reorder — `dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`).
- Rich text editor for `LessonType.TEXT` content — Tiptap (`@tiptap/react`, `@tiptap/starter-kit`). Store HTML in `Lesson.content`.
- Quiz builder — inline add/edit `Question` + `QuestionOption`, mark `isCorrect`. Connected to existing Quiz model.
- Thumbnail upload via Phase B `ThumbnailUploader`.
- Video upload via Phase B `VideoUploader`.
- Wire orphan actions to UI: `deleteCourse`, `updateChapter`, `updateLesson`, `deleteChapter`, `deleteLesson`.

### Out of Scope
Real file storage (Phase B mocks only), video transcoding, live student preview, AI-assisted content generation, version history.

### DB Models
None new. Existing `Course`, `Chapter`, `Lesson`, `Quiz`, `Question`, `QuestionOption` cover scope.
- Confirm `Chapter.order` and `Lesson.order` int fields exist for drag-reorder persistence.

### New Routes/Files
- `app/(dashboard)/dashboard/instructor/courses/[courseId]/builder/page.tsx` — main builder — L
- `components/builder/ChapterList.tsx` (sortable) — M
- `components/builder/LessonItem.tsx` (sortable) — S
- `components/builder/RichTextEditor.tsx` (Tiptap) — M
- `components/builder/QuizBuilder.tsx` — L
- `components/builder/LessonEditor.tsx` (switches by type) — M
- `lib/actions/course.ts` — add `reorderChapters`, `reorderLessons`, `deleteChapter`, `deleteLesson` — M
- `lib/actions/quiz.ts` — add `createQuestion`, `updateQuestion`, `deleteQuestion` — M

### Dependencies
- Phase B (uploader components reused).

### Complexity Total
L

---

## Phase D — Student Features

**Objective:** Add student-facing features that improve learning UX.

### In Scope
- Wishlist — DB model, server actions (`addToWishlist`, `removeFromWishlist`, `getWishlist`), heart-icon toggle on `CourseCard`, `/dashboard/wishlist` page.
- Discussion/Q&A per lesson — DB models (`Discussion`, `DiscussionReply`), thread UI in player Discussion tab (replaces stub), actions (`createDiscussion`, `replyToDiscussion`, `deleteDiscussion`).
- Public profile — `/profile/[userId]` — avatar, name, headline, enrolled-courses count, certificates earned. Read-only.
- Invoice/receipt — `/dashboard/orders/[orderId]/invoice` — printable order detail page (CSS `@media print`).

### Out of Scope
Real-time WebSocket updates, file attachments in discussions, threaded nested replies (one-level only), invoice PDF generation.

### DB Models (new)
- `Wishlist` — `id`, `userId @unique`, `createdAt`. (One per user.)
- `WishlistItem` — `id`, `wishlistId`, `courseId`, `createdAt`. Unique on `(wishlistId, courseId)`.
- `Discussion` — `id`, `lessonId`, `userId`, `body`, `createdAt`, `updatedAt`.
- `DiscussionReply` — `id`, `discussionId`, `userId`, `body`, `createdAt`, `updatedAt`.
- Add `User.headline String?` field for public profile.

### New Routes/Files
- `app/(dashboard)/dashboard/wishlist/page.tsx` — S
- `app/profile/[userId]/page.tsx` — M
- `app/(dashboard)/dashboard/orders/[orderId]/invoice/page.tsx` — S
- `lib/actions/wishlist.ts` — M
- `lib/actions/discussion.ts` — M
- `lib/queries/wishlist.ts` — S
- `lib/queries/profile.ts` — S
- `components/course/WishlistButton.tsx` — S
- `components/player/DiscussionPanel.tsx` — M
- Update `components/course/CourseCard.tsx` — add wishlist heart — S

### Dependencies
None. All purely DB + UI.

### Complexity Total
L

---

## Phase E — Instructor & Admin Extensions

**Objective:** Complete instructor monetization visibility + admin platform controls.

### In Scope
- Instructor payout — mock withdrawal request form, `Payout` DB model, status flow `PENDING → APPROVED | REJECTED`. Admin approves manually (no real bank API).
- Admin Categories CRUD — `/dashboard/admin/categories` — list, create, edit, delete (block delete if used by courses).
- Admin Coupon system — `Coupon` DB model, validate on checkout page, apply discount to `Order.amount`.
- Admin Platform Analytics — `/dashboard/admin/analytics` — real DB aggregates: users by role, total revenue, course count by status, enrollment trends (daily/weekly).

### Out of Scope
Real bank/payout API, payment disputes, support tickets, payout fee calculation, tax forms, multi-currency.

### DB Models (new)
- `Payout` — `id`, `instructorId`, `amount` (Decimal), `status` (enum: PENDING/APPROVED/REJECTED), `requestedAt`, `processedAt?`, `note?`.
- `Coupon` — `id`, `code @unique`, `discountPercent` (Int 1–100), `maxUses` (Int?), `usedCount` (Int default 0), `expiresAt` (DateTime?), `createdAt`, `isActive` (Boolean default true).
- `Order.couponId String?` — track which coupon was used.

### New Routes/Files
- `app/(dashboard)/dashboard/instructor/payouts/page.tsx` — M
- `app/(dashboard)/dashboard/admin/categories/page.tsx` — M
- `app/(dashboard)/dashboard/admin/coupons/page.tsx` — M
- `app/(dashboard)/dashboard/admin/analytics/page.tsx` — M
- `app/(dashboard)/dashboard/admin/payouts/page.tsx` — admin approval queue — M
- `lib/actions/payout.ts` — `requestPayout`, `approvePayout`, `rejectPayout` — M
- `lib/actions/coupon.ts` — `createCoupon`, `updateCoupon`, `deleteCoupon`, `validateCoupon` — M
- `lib/actions/category.ts` — `createCategory`, `updateCategory`, `deleteCategory` — S
- `lib/queries/analytics.ts` — aggregation queries — M
- Update `lib/actions/order.ts:createOrder` — accept `couponCode`, apply discount — S
- Update checkout page — coupon input field — S

### Dependencies
- Phase A (admin needs working email for notifications, optional).

### Complexity Total
L

---

## Phase F — Polish & Deploy

**Objective:** Production-ready, publicly accessible portfolio demo.

### In Scope
- Full audit: add `loading.tsx` + `error.tsx` to every route missing them.
- Legal pages — `/terms`, `/privacy`, `/refund` — static MDX/markdown content.
- SEO — `generateMetadata()` per page, OG image generation (`next/og`), `sitemap.xml`, `robots.txt`.
- Lighthouse audit + fixes — target ≥ 90 desktop, ≥ 80 mobile.
- Seed script — `prisma/seed.ts` — 3 instructors, 10 courses, 50 students, enrollments, reviews, certificates.
- CI/CD — GitHub Actions: lint + `tsc --noEmit` + `next build` on every PR.
- Vercel deploy — production project + Neon production DB.
- Sentry monitoring — `@sentry/nextjs` free tier.

### Out of Scope
Load testing, CDN tuning, custom domain (optional add-on), A/B testing, feature flags.

### DB Models
None new. Seed only.

### New Routes/Files
- `app/(marketing)/terms/page.tsx` — S
- `app/(marketing)/privacy/page.tsx` — S
- `app/(marketing)/refund/page.tsx` — S
- `app/sitemap.ts` — S
- `app/robots.ts` — S
- `app/opengraph-image.tsx` — S
- `prisma/seed.ts` — M
- `.github/workflows/ci.yml` — S
- `sentry.client.config.ts` + `sentry.server.config.ts` — S
- `loading.tsx` + `error.tsx` per route (audit-driven count) — M

### Dependencies
- All previous phases (deploys final state).

### Complexity Total
M

---

## Phase Sequencing Summary

| Phase | Name | Blocks | Complexity |
|---|---|---|---|
| A | Auth Completion | B,C,D,E,F (real users) | M |
| B | File & Media | C (uploaders reused) | M |
| C | Course Builder | F (demo content) | L |
| D | Student Features | F (demo content) | L |
| E | Instructor/Admin Ext | F (demo content) | L |
| F | Polish & Deploy | — | M |

**Recommended order:** A → B → C → D → E → F. C/D/E can run parallel after B.
