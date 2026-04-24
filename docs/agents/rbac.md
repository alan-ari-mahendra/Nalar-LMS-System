# RBAC Agent — Nalar LMS

## Role
Implement and maintain all authorization logic across the application.
You own: src/lib/auth/, src/middleware.ts, and role-checking utilities.
You do NOT design database schemas or build UI components.

## Before Anything
Read these files first, every session:
- CLAUDE.md
- prisma/schema.prisma (understand Role enum and User model)
- src/lib/auth/ (audit what already exists)
- src/middleware.ts (current route protection state)

## Role Definitions

### ADMIN
- Full platform access
- Can manage all users, courses, enrollments
- Can change any user's role
- Can approve/reject courses
- Can access /dashboard/admin/*

### TEACHER
- Can create, edit, publish own courses
- Can view own students and analytics
- Cannot access other teachers' data
- Can access /dashboard/teacher/*

### STUDENT
- Can browse and enroll in courses
- Can only view own progress, certificates, orders
- Cannot access teacher or admin dashboards
- Can access /dashboard/*

## Files to Own

### src/lib/auth/session.ts
Manages server-side session lifecycle:

```ts
// Functions to implement:
createSession(userId: string, meta: { ip?: string; userAgent?: string }): Promise<Session>
getSession(token: string): Promise<(Session & { user: User }) | null>
refreshSession(token: string): Promise<Session | null>
deleteSession(token: string): Promise<void>
deleteAllUserSessions(userId: string): Promise<void>
```

Session token stored in httpOnly cookie named "session".
Expiry: 30 days. Refresh if < 7 days remaining.

### src/lib/auth/password.ts
```ts
// Functions to implement:
hashPassword(plain: string): Promise<string>      // bcrypt, rounds=12
verifyPassword(plain: string, hash: string): Promise<boolean>
```

### src/lib/auth/actions.ts
Server actions for auth flows:

```ts
// Functions to implement:
register(data: RegisterInput): Promise<ActionResult>
  // 1. Check email not taken
  // 2. Hash password
  // 3. Create User + Credential in transaction
  // 4. Create session
  // 5. Log REGISTER audit event
  // 6. Return { success, redirectTo }

login(data: LoginInput): Promise<ActionResult>
  // 1. Find user by email
  // 2. Verify password against Credential
  // 3. Check user.isActive
  // 4. Create session, set cookie
  // 5. Log LOGIN audit event
  // 6. Return { success, redirectTo: roleBasedRedirect(user.role) }

logout(): Promise<void>
  // 1. Get session token from cookie
  // 2. Delete session from DB
  // 3. Clear cookie
  // 4. Log LOGOUT audit event

getCurrentUser(): Promise<User | null>
  // 1. Get token from cookie
  // 2. getSession(token)
  // 3. Return session.user or null
```

### src/lib/auth/guards.ts
Reusable role-checking utilities:

```ts
// Functions to implement:
requireAuth(): Promise<User>
  // Calls getCurrentUser(), throws redirect("/auth/login") if null

requireRole(roles: Role[]): Promise<User>
  // Calls requireAuth(), throws redirect("/unauthorized") if role not in list

can(user: User, action: string, resource?: unknown): boolean
  // Simple permission checker:
  // can(user, "course:edit", course) → checks user.id === course.teacherId || user.role === ADMIN
  // can(user, "user:manage") → checks user.role === ADMIN
```

Permission map to implement:
```ts
const permissions = {
  "course:create":  ["TEACHER", "ADMIN"],
  "course:edit":    ["TEACHER", "ADMIN"],   // + ownership check
  "course:publish": ["TEACHER", "ADMIN"],
  "course:delete":  ["ADMIN"],
  "user:manage":    ["ADMIN"],
  "user:role-change": ["ADMIN"],
  "enrollment:manage": ["ADMIN"],
  "analytics:view": ["TEACHER", "ADMIN"],
}
```

### src/middleware.ts
Route-based protection using getSession():

```ts
// Route guard matrix:
const routeGuards: Record<string, Role[]> = {
  "/dashboard/admin":   ["ADMIN"],
  "/dashboard/teacher": ["ADMIN", "TEACHER"],
  "/dashboard":         ["ADMIN", "TEACHER", "STUDENT"],
  "/learn":             ["ADMIN", "TEACHER", "STUDENT"],
}

// Logic:
// 1. Skip public routes: /, /courses/*, /certificate/*, /auth/*
// 2. Get session from cookie
// 3. If no session → redirect /auth/login?callbackUrl=...
// 4. If session but wrong role → redirect /unauthorized
// 5. Attach user role to request headers for downstream use
```

### src/lib/auth/index.ts
Barrel export — re-exports everything from above files.

## Role-Based Redirects After Login
```ts
const roleRedirect: Record<Role, string> = {
  ADMIN:   "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard",
}
```

## Audit Log Events
Log these events using AuditLog model:
- REGISTER — new user created
- LOGIN — successful login
- LOGIN_FAILED — wrong password (log email + ip, NOT password)
- LOGOUT — session ended
- ROLE_CHANGE — admin changed a user's role (log oldRole + newRole)
- PASSWORD_RESET_REQUEST — forgot password flow
- PASSWORD_RESET_COMPLETE — password successfully changed
- EMAIL_VERIFIED — email verification completed

## Cookie Config
```ts
const COOKIE_CONFIG = {
  name: "session",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
}
```

## Input Validation
Use zod for all auth inputs:

```ts
const RegisterSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8).max(100)
             .regex(/[A-Z]/, "Must contain uppercase")
             .regex(/[0-9]/, "Must contain number"),
  role:     z.enum(["STUDENT", "TEACHER"]), // ADMIN never self-registers
})

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})
```

## Error Handling
Never expose internal errors to client. Map to safe messages:
```ts
const AUTH_ERRORS = {
  USER_NOT_FOUND:    "Invalid email or password",
  WRONG_PASSWORD:    "Invalid email or password",  // same message — no enumeration
  USER_INACTIVE:     "This account has been suspended",
  EMAIL_TAKEN:       "An account with this email already exists",
  INVALID_TOKEN:     "This link is invalid or has expired",
}
```

## Per-Task Checklist
Before marking any auth task done:
- [ ] npx tsc --noEmit — zero errors
- [ ] npm run build — zero errors
- [ ] No plain-text passwords anywhere in logs or responses
- [ ] All cookies httpOnly
- [ ] All server actions use "use server" directive
- [ ] Zod validation on all inputs
- [ ] Audit log written for every auth event

## Constraints
- Never use JWT for sessions — use DB sessions (Session model)
- Never store sensitive data in cookies — token only
- Never expose password hashes in any response or log
- Never allow ADMIN role self-registration — admin must be set via DB or by another admin
- All auth functions are server-side only — no "use client"
- Install: npm install bcryptjs zod, npm install -D @types/bcryptjs
