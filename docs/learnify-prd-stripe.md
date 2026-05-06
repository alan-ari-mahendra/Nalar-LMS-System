# Learnify — PRD: Stripe Sandbox Integration

> Real payment flow via Stripe Checkout (test mode). Replaces mock gateway for credit/debit card payments while preserving mock gateway for other methods and local development.

---

## Out of Scope

Stripe Payment Elements (embedded form), Stripe Customer objects, Stripe Subscriptions, real refund via Stripe API, Midtrans integration, multi-currency support, Apple Pay / Google Pay, Stripe Connect (marketplace split payments), Stripe webhooks beyond `checkout.session.completed`, Stripe CLI production monitoring.

---

## Phase G — Stripe Sandbox Payment

**Objective:** Replace mock credit card flow with real Stripe Checkout (test mode) so payments go through Stripe's sandbox — including 3DS challenge, card decline simulation, and async webhook confirmation. Mock gateway remains available for non-card methods and dev convenience.

### In Scope

- Stripe SDK setup — `stripe` npm package, `lib/stripe/client.ts` singleton with `STRIPE_SECRET_KEY`.
- New payment method `"STRIPE"` added to `PaymentMethodEnum` and `PAYMENT_METHODS[]`.
- Server action `createStripeCheckoutSession(orderId)` — validates order is PENDING, converts IDR amount to USD (fixed rate), calls `stripe.checkout.sessions.create()` with `mode: "payment"`, stores `session.id` in `order.paymentId`, returns `session.url`.
- Webhook endpoint `POST /api/stripe/webhook` — verifies Stripe signature, handles `checkout.session.completed` event, extracts `orderId` from `session.metadata`, runs the same transaction logic as `mockConfirmPayment()` (update order → COMPLETED, increment coupon usedCount, call `createEnrollmentTx()`). Idempotent via `where: { id, status: "PENDING" }` guard.
- `StripeCheckout.tsx` component — shown at `/checkout/order/[orderId]/pay` when `paymentMethod === "STRIPE"`. Displays order summary + "Pay with Stripe" button that calls `createStripeCheckoutSession()` then redirects to `session.url`. Shows error state if session creation fails. Shows "Cancel" button back to course page.
- Conditional render in `pay/page.tsx` — if `paymentMethod === "STRIPE"` render `StripeCheckout`, else render existing `MockGateway`.
- Success page resilience — `success/page.tsx` detects if order is still `PENDING` (webhook arrived yet), shows "Confirming your payment..." spinner with client-side polling every 3 seconds until status becomes `COMPLETED` or `FAILED`, then renders normal success/failed content.
- `cancelOrder()` action updated — also works for STRIPE PENDING orders (user cancels before redirecting to Stripe).
- "Resume" link on orders page — for STRIPE PENDING orders, creates a new Checkout Session and redirects (handles expired sessions).
- Env vars: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### Out of Scope

Stripe Payment Elements (embedded card form), saving cards for reuse, Stripe Customer CRUD, Stripe refund API calls (admin refund stays as DB-only status change), Stripe Connect for instructor payout splitting, handling other webhook events (`payment_intent.payment_failed`, `charge.refunded`, etc.), email receipts from Stripe, Stripe tax calculation, multiple currencies in Stripe.

### DB Models

**None new. No migration required.** Existing `Order` fields map directly:

| Field | Mock Usage | Stripe Usage |
|---|---|---|
| `paymentMethod` | `"CREDIT_CARD"` | `"STRIPE"` |
| `paymentId` | `mock_{uuid}` | `cs_test_{stripe_session_id}` |
| `metadata` | `{ mock: true, ... }` | `{ stripe: true, sessionId: "...", paymentIntent: "..." }` |
| `status` | PENDING → COMPLETED | PENDING → COMPLETED (via webhook) |

### New Routes/Files

- `lib/stripe/client.ts` — Stripe instance init — S
- `lib/stripe/checkout.ts` — `createCheckoutSession()`, `getStripeSession()` — M
- `app/api/stripe/webhook/route.ts` — POST handler, signature verification, `checkout.session.completed` processing — L
- `app/checkout/order/[orderId]/pay/StripeCheckout.tsx` — redirect-to-Stripe UI — M

### Modified Routes/Files

- `lib/actions/schemas.ts` — add `"STRIPE"` to `PaymentMethodEnum` — S
- `lib/payment/methods.ts` — add STRIPE entry to `PAYMENT_METHODS[]` — S
- `lib/actions/order.ts` — add `createStripeCheckoutSession()` server action, no changes to `mockConfirmPayment()` — M
- `app/checkout/order/[orderId]/pay/page.tsx` — conditional render StripeCheckout vs MockGateway — S
- `app/checkout/order/[orderId]/success/page.tsx` — add PENDING polling state — M
- `package.json` — add `stripe` dependency — S

### Dependencies

- Phase E (Order, Coupon, Enrollment models must exist — already shipped).

### Test Cards (Stripe Sandbox)

| Scenario | Card Number | CVC | Result |
|---|---|---|---|
| Success | `4242 4242 4242 4242` | Any | `checkout.session.completed` fires |
| Decline | `4000 0000 0000 0002` | Any | `payment_intent.payment_failed` (not handled — order stays PENDING, user sees "Confirming..." forever → needs manual expiry or Phase 2) |
| 3DS required | `4000 0025 0000 3155` | Any | Stripe shows 3DS challenge modal → pass → success |
| Expired card | `4000 0000 0000 0069` | Any | Decline |

All test cards: any future expiry date, any postal code.

### Webhook Flow Diagram

```
User browser                    Learnify Server                   Stripe
     │                               │                              │
     │  POST createStripeSession     │                              │
     │──────────────────────────────>│                              │
     │                               │  checkout.sessions.create()   │
     │                               │─────────────────────────────>│
     │                               │  { id, url }                  │
     │                               │<─────────────────────────────│
     │  { sessionUrl }               │                              │
     │<──────────────────────────────│                              │
     │                               │                              │
     │  redirect to sessionUrl       │                              │
     │─────────────────────────────────────────────────────────────>│
     │                               │                              │
     │  [User pays on Stripe page]   │                              │
     │                               │                              │
     │  redirect to success_url      │                              │
     │<─────────────────────────────────────────────────────────────│
     │                               │                              │
     │                               │  POST /api/stripe/webhook    │
     │                               │  (checkout.session.completed)│
     │                               │<─────────────────────────────│
     │                               │                              │
     │                               │  verify signature             │
     │                               │  find order by metadata       │
     │                               │  $transaction:                │
     │                               │    order → COMPLETED          │
     │                               │    coupon increment           │
     │                               │    createEnrollmentTx()       │
     │                               │                              │
     │  success page renders         │                              │
     │  (polling finds COMPLETED)    │                              │
     │                               │                              │
```

### Edge Cases

| Case | Behavior |
|---|---|
| Webhook arrives before user lands on success page | User sees normal success content immediately (no spinner) |
| User lands on success page before webhook | Spinner "Confirming your payment..." polls every 3s until COMPLETED or FAILED |
| Webhook never arrives (server down) | Stripe retries with exponential backoff for 72h. Order stays PENDING. User sees spinner. **Mitigation:** add cron job or manual admin tool to expire stale PENDING orders (Phase 2) |
| User clicks "Resume" on expired Stripe session | `createStripeCheckoutSession()` creates a new session (Stripe allows multiple sessions per order), updates `order.paymentId` to new session ID |
| Duplicate webhook delivery | `where: { id, status: "PENDING" }` guard — second delivery finds order already COMPLETED, update no-ops, returns 200 |
| User cancels before Stripe redirect | `cancelOrder()` marks order FAILED. If webhook later arrives, guard rejects it (status not PENDING) |
| Coupon applied + Stripe | Coupon resolved at `createOrder()` time (already implemented). Final discounted amount sent to Stripe. No coupon logic in webhook. |
| Free course + Stripe | Blocked by existing `createOrder()` validation ("This is a free course. Use the free enrollment flow.") |

### Local Development

Stripe CLI required for local webhook testing:

```bash
# Install
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This prints STRIPE_WEBHOOK_SECRET=whsec_xxx — use in .env.local
```

Trigger test events manually:
```bash
stripe trigger checkout.session.completed
```

### Complexity Total

L

---

## Phase Sequencing Update

| Phase | Name | Blocks | Complexity |
|---|---|---|---|
| A | Auth Completion | B,C,D,E,F,G (real users) | M |
| B | File & Media | C (uploaders reused) | M |
| C | Course Builder | F (demo content) | L |
| D | Student Features | F (demo content) | L |
| E | Instructor/Admin Ext | F (demo content) | L |
| F | Polish & Deploy | — | M |
| **G** | **Stripe Sandbox** | **—** | **L** |

**Recommended order:** A → B → C → D → E → F → G. Phase G is independent and can run after E (Order model exists). Can be parallelized with F if needed.

### Future Stripe Enhancements (Not Planned)

- **Phase H1 — Payment Elements:** Replace Stripe Checkout redirect with embedded card form using `@stripe/stripe-js` + `@stripe/react-stripe-js`. Keeps user in-app.
- **Phase H2 — Webhook Completeness:** Handle `payment_intent.payment_failed` (auto-mark order FAILED), `charge.refunded` (sync with admin refund action), `charge.dispute.created` (alert admin).
- **Phase H3 — Stripe Connect:** Split payments between platform and instructors. Replace mock payout with real Stripe Transfer to instructor Connected Accounts.
- **Phase H4 — Saved Cards & Customers:** Create Stripe Customer on first purchase, attach PaymentMethod, allow one-click recheckouts.
- **Phase H5 — Stale Order Cleanup:** Cron job (Vercel Cron or external scheduler) to mark PENDING orders as FAILED after 24h if no webhook received.

## File Changes

### New Files (5)

| File | Description |
|---|---|
| `lib/stripe/client.ts` | Stripe instance + exchange rate constant |
| `lib/stripe/checkout.ts` | Functions to create & retrieve Checkout Session |
| `app/api/stripe/webhook/route.ts` | Webhook handler for `checkout.session.completed` |
| `app/checkout/order/[orderId]/pay/StripeCheckout.tsx` | Payment page UI for Stripe flow |
| `app/checkout/order/[orderId]/success/PaymentConfirming.tsx` | Polling spinner when order is still PENDING |

### Modified Files (5)

| File | Changes |
|---|---|
| `lib/actions/schemas.ts` | Add `"STRIPE"` to `PaymentMethodEnum` |
| `lib/payment/methods.ts` | Add STRIPE entry, rename CREDIT_CARD to "(Mock)" |
| `lib/actions/order.ts` | Add `createStripeCheckoutSession()` action |
| `app/checkout/order/[orderId]/pay/page.tsx` | Conditional render: STRIPE → `StripeCheckout`, else → `MockGateway` |
| `app/checkout/order/[orderId]/success/page.tsx` | Add PENDING condition → render `PaymentConfirming` |

### Other Files to Update (2)

| File | Changes |
|---|---|
| `package.json` | Add `stripe` dependency |
| `.env.local` | Add 4 variables: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

**Total: 12 files** (5 new, 5 modified, 2 config)