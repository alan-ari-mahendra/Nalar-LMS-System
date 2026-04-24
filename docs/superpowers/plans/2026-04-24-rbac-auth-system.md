# RBAC Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement complete server-side auth system with password hashing, DB sessions, server actions, role guards, and route middleware.

**Architecture:** DB-backed sessions with httpOnly cookies. Bcrypt password hashing. Zod-validated server actions for register/login/logout. Role-based guards (requireAuth, requireRole, can). Next.js middleware for route protection. All server-side only — no "use client".

**Tech Stack:** Next.js 14+ (App Router), Prisma 7, bcryptjs, zod, TypeScript strict mode.

**Note:** Project has no `src/` directory. `@/*` alias maps to project root. All paths use `lib/auth/*` not `src/lib/auth/*`.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/db.ts` | Prisma client singleton |
| `lib/auth/password.ts` | bcrypt hash + verify |
| `lib/auth/session.ts` | DB session CRUD + cookie management |
| `lib/auth/actions.ts` | Server actions: register, login, logout, getCurrentUser |
| `lib/auth/guards.ts` | requireAuth, requireRole, can() permission checker |
| `lib/auth/index.ts` | Barrel re-export |
| `middleware.ts` | Route-based role protection |

---

### Task 0: Prisma Client Singleton

**Files:**
- Create: `lib/db.ts`

- [ ] **Step 1: Create Prisma client singleton**

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Generate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 1: Password Utilities

**Files:**
- Create: `lib/auth/password.ts`

- [ ] **Step 1: Implement hashPassword and verifyPassword**

```ts
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 2: Session Management

**Files:**
- Create: `lib/auth/session.ts`

- [ ] **Step 1: Implement session CRUD + cookie helpers**

```ts
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import type { Session, User } from "@prisma/client"

const SESSION_EXPIRY_DAYS = 30
const REFRESH_THRESHOLD_DAYS = 7

const COOKIE_CONFIG = {
  name: "session",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
}

export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string }
): Promise<Session> {
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  )

  const session = await prisma.session.create({
    data: {
      userId,
      ipAddress: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_CONFIG.name, session.token, {
    httpOnly: COOKIE_CONFIG.httpOnly,
    secure: COOKIE_CONFIG.secure,
    sameSite: COOKIE_CONFIG.sameSite,
    path: COOKIE_CONFIG.path,
    maxAge: COOKIE_CONFIG.maxAge,
  })

  return session
}

export async function getSession(
  token: string
): Promise<(Session & { user: User }) | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  // Refresh if within threshold
  const daysUntilExpiry =
    (session.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)

  if (daysUntilExpiry < REFRESH_THRESHOLD_DAYS) {
    await refreshSession(token)
  }

  // Update lastActiveAt
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  })

  return session
}

export async function refreshSession(
  token: string
): Promise<Session | null> {
  const newExpiry = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  )

  const session = await prisma.session.update({
    where: { token },
    data: { expiresAt: newExpiry },
  })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_CONFIG.name, token, {
    httpOnly: COOKIE_CONFIG.httpOnly,
    secure: COOKIE_CONFIG.secure,
    sameSite: COOKIE_CONFIG.sameSite,
    path: COOKIE_CONFIG.path,
    maxAge: COOKIE_CONFIG.maxAge,
  })

  return session
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {})
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_CONFIG.name)
}

export async function deleteAllUserSessions(
  userId: string
): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_CONFIG.name)?.value ?? null
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 3: Auth Server Actions

**Files:**
- Create: `lib/auth/actions.ts`

- [ ] **Step 1: Implement schemas, error map, and types**

```ts
"use server"

import { z } from "zod/v4"
import { prisma } from "@/lib/db"
import { hashPassword, verifyPassword } from "./password"
import { createSession, deleteSession, getSession, getSessionToken } from "./session"
import type { User } from "@prisma/client"
import type { Role } from "@prisma/client"

// --- Schemas ---

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  role: z.enum(["STUDENT", "TEACHER"]),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type RegisterInput = z.infer<typeof RegisterSchema>
type LoginInput = z.infer<typeof LoginSchema>

// --- Error Map ---

const AUTH_ERRORS = {
  USER_NOT_FOUND: "Invalid email or password",
  WRONG_PASSWORD: "Invalid email or password",
  USER_INACTIVE: "This account has been suspended",
  EMAIL_TAKEN: "An account with this email already exists",
  INVALID_TOKEN: "This link is invalid or has expired",
} as const

// --- Types ---

type ActionResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string }

// --- Role Redirect ---

const roleRedirect: Record<Role, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard",
}
```

- [ ] **Step 2: Implement register action**

Add to same file after the types:

```ts
export async function register(data: RegisterInput): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { name, email, password, role } = parsed.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { success: false, error: AUTH_ERRORS.EMAIL_TAKEN }
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, role },
    })

    await tx.credential.create({
      data: {
        userId: newUser.id,
        provider: "EMAIL",
        passwordHash,
      },
    })

    return newUser
  })

  await createSession(user.id, {})

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "REGISTER",
      metadata: { email },
    },
  })

  return { success: true, redirectTo: roleRedirect[user.role] }
}
```

- [ ] **Step 3: Implement login action**

Add to same file:

```ts
export async function login(data: LoginInput): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      credentials: {
        where: { provider: "EMAIL" },
        take: 1,
      },
    },
  })

  if (!user || user.credentials.length === 0) {
    return { success: false, error: AUTH_ERRORS.USER_NOT_FOUND }
  }

  const credential = user.credentials[0]
  if (!credential.passwordHash) {
    return { success: false, error: AUTH_ERRORS.USER_NOT_FOUND }
  }

  const valid = await verifyPassword(password, credential.passwordHash)
  if (!valid) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_FAILED",
        metadata: { email },
      },
    })
    return { success: false, error: AUTH_ERRORS.WRONG_PASSWORD }
  }

  if (!user.isActive) {
    return { success: false, error: AUTH_ERRORS.USER_INACTIVE }
  }

  await createSession(user.id, {})

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      metadata: { email },
    },
  })

  return { success: true, redirectTo: roleRedirect[user.role] }
}
```

- [ ] **Step 4: Implement logout and getCurrentUser**

Add to same file:

```ts
export async function logout(): Promise<void> {
  const token = await getSessionToken()
  if (!token) return

  const session = await getSession(token)
  if (session) {
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "LOGOUT",
      },
    })
  }

  await deleteSession(token)
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null

  const session = await getSession(token)
  return session?.user ?? null
}
```

- [ ] **Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 4: Role Guards

**Files:**
- Create: `lib/auth/guards.ts`

- [ ] **Step 1: Implement requireAuth, requireRole, and can**

```ts
import { redirect } from "next/navigation"
import { getCurrentUser } from "./actions"
import type { User } from "@prisma/client"
import type { Role } from "@prisma/client"

const permissions: Record<string, Role[]> = {
  "course:create": ["TEACHER", "ADMIN"],
  "course:edit": ["TEACHER", "ADMIN"],
  "course:publish": ["TEACHER", "ADMIN"],
  "course:delete": ["ADMIN"],
  "user:manage": ["ADMIN"],
  "user:role-change": ["ADMIN"],
  "enrollment:manage": ["ADMIN"],
  "analytics:view": ["TEACHER", "ADMIN"],
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export function can(
  user: User,
  action: string,
  resource?: { userId?: string; teacherId?: string }
): boolean {
  const allowedRoles = permissions[action]
  if (!allowedRoles) return false

  if (user.role === "ADMIN") return true

  if (!allowedRoles.includes(user.role)) return false

  // Ownership check for resource-scoped actions
  if (resource) {
    const ownerId = resource.teacherId ?? resource.userId
    if (ownerId && ownerId !== user.id) return false
  }

  return true
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 5: Barrel Export

**Files:**
- Create: `lib/auth/index.ts`

- [ ] **Step 1: Create barrel export**

```ts
export { hashPassword, verifyPassword } from "./password"
export {
  createSession,
  getSession,
  refreshSession,
  deleteSession,
  deleteAllUserSessions,
  getSessionToken,
} from "./session"
export {
  register,
  login,
  logout,
  getCurrentUser,
  RegisterSchema,
  LoginSchema,
} from "./actions"
export { requireAuth, requireRole, can } from "./guards"
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 6: Route Middleware

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Implement middleware with route guards**

Note: Next.js middleware runs on Edge Runtime — cannot use Prisma directly. Must use lightweight cookie check + fetch to validate session. For Phase 3a, implement cookie-presence check with role header passthrough. Full DB validation happens in server components via guards.

```ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = [
  "/",
  "/courses",
  "/certificate",
  "/auth",
  "/api",
  "/_next",
  "/favicon.ico",
]

const protectedRoutes: { path: string; roles?: string[] }[] = [
  { path: "/dashboard/admin", roles: ["ADMIN"] },
  { path: "/dashboard/teacher", roles: ["ADMIN", "TEACHER"] },
  { path: "/dashboard", roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { path: "/learn", roles: ["ADMIN", "TEACHER", "STUDENT"] },
]

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("session")?.value

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session exists — allow through
  // Full role validation happens in server components via requireRole()
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 7: Final Verification

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Security checklist**
- No plain-text passwords in logs or responses
- All cookies httpOnly
- All server actions use "use server" directive
- Zod validation on all inputs
- Audit log written for every auth event
- ADMIN cannot self-register
