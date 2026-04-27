"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { hashPassword, verifyPassword } from "./password"
import {
  createSession,
  deleteAllUserSessions,
  deleteSession,
  getSession,
  getSessionToken,
} from "./session"
import { requireAuth } from "./guards"
import { generateToken, expiryDate, TOKEN_TTL } from "./tokens"
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
} from "./schemas"
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ResendVerificationInput,
} from "./schemas"
import { sendEmail } from "@/lib/email/client"
import { buildVerifyEmail } from "@/lib/email/templates/verify"
import { buildPasswordResetEmail } from "@/lib/email/templates/password-reset"
import type { User } from "@prisma/client"
import type { Role } from "@prisma/client"

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

// --- Actions ---

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

  await dispatchVerificationEmail(user.email, user.name ?? "there").catch((err) => {
    console.error("[register] failed to send verify email", err)
  })

  return { success: true, redirectTo: roleRedirect[user.role] }
}

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

type ProfileResult = { success: true } | { success: false; error: string }

export async function updateProfile(data: UpdateProfileInput): Promise<ProfileResult> {
  const parsed = UpdateProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { name, headline, bio, website } = parsed.data

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      headline: headline ?? null,
      bio: bio ?? null,
      website: website ? website : null,
    },
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function changePassword(data: ChangePasswordInput): Promise<ProfileResult> {
  const parsed = ChangePasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { currentPassword, newPassword } = parsed.data

  const credential = await prisma.credential.findUnique({
    where: { userId_provider: { userId: user.id, provider: "EMAIL" } },
  })

  if (!credential || !credential.passwordHash) {
    return { success: false, error: "Password authentication is not enabled for this account" }
  }

  const valid = await verifyPassword(currentPassword, credential.passwordHash)
  if (!valid) {
    return { success: false, error: "Current password is incorrect" }
  }

  const newHash = await hashPassword(newPassword)
  await prisma.credential.update({
    where: { id: credential.id },
    data: { passwordHash: newHash },
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_CHANGE",
    },
  })

  return { success: true }
}

// --- Email verification & password reset ---

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"

async function dispatchVerificationEmail(email: string, name: string): Promise<void> {
  await prisma.verificationToken.deleteMany({ where: { email } })

  const token = generateToken()
  await prisma.verificationToken.create({
    data: {
      token,
      email,
      expiresAt: expiryDate(TOKEN_TTL.VERIFY_EMAIL_MS),
    },
  })

  const verifyUrl = `${APP_URL}/auth/verify?token=${token}`
  const { subject, html, text } = buildVerifyEmail({ name, verifyUrl })
  await sendEmail({ to: email, subject, html, text })
}

async function dispatchPasswordResetEmail(email: string, name: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { email, usedAt: null } })

  const token = generateToken()
  await prisma.passwordResetToken.create({
    data: {
      token,
      email,
      expiresAt: expiryDate(TOKEN_TTL.PASSWORD_RESET_MS),
    },
  })

  const resetUrl = `${APP_URL}/auth/reset?token=${token}`
  const { subject, html, text } = buildPasswordResetEmail({ name, resetUrl })
  await sendEmail({ to: email, subject, html, text })
}

type GenericResult = { success: true } | { success: false; error: string }

export async function requestPasswordReset(data: ForgotPasswordInput): Promise<GenericResult> {
  const parsed = ForgotPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to prevent email enumeration
  if (!user || !user.isActive) {
    return { success: true }
  }

  await dispatchPasswordResetEmail(user.email, user.name ?? "there").catch((err) => {
    console.error("[requestPasswordReset] dispatch failed", err)
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET_REQUEST",
      metadata: { email },
    },
  })

  return { success: true }
}

export async function resetPassword(data: ResetPasswordInput): Promise<GenericResult> {
  const parsed = ResetPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { token, newPassword } = parsed.data

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { success: false, error: AUTH_ERRORS.INVALID_TOKEN }
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } })
  if (!user) {
    return { success: false, error: AUTH_ERRORS.INVALID_TOKEN }
  }

  const credential = await prisma.credential.findUnique({
    where: { userId_provider: { userId: user.id, provider: "EMAIL" } },
  })
  if (!credential) {
    return { success: false, error: AUTH_ERRORS.INVALID_TOKEN }
  }

  const newHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.credential.update({
      where: { id: credential.id },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  await deleteAllUserSessions(user.id)

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET",
      metadata: { email: user.email },
    },
  })

  return { success: true }
}

export async function verifyEmail(data: VerifyEmailInput): Promise<GenericResult> {
  const parsed = VerifyEmailSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { token } = parsed.data
  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { success: false, error: AUTH_ERRORS.INVALID_TOKEN }
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } })
  if (!user) {
    return { success: false, error: AUTH_ERRORS.INVALID_TOKEN }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.verificationToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "EMAIL_VERIFIED",
      metadata: { email: user.email },
    },
  })

  return { success: true }
}

export async function resendVerification(
  data: ResendVerificationInput
): Promise<GenericResult> {
  const parsed = ResendVerificationSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  // Generic success response — don't leak existence
  if (!user || user.emailVerified || !user.isActive) {
    return { success: true }
  }

  await dispatchVerificationEmail(user.email, user.name ?? "there").catch((err) => {
    console.error("[resendVerification] dispatch failed", err)
  })

  return { success: true }
}
