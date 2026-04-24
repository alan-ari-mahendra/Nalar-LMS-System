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

  // Update lastActiveAt + refresh expiry if within threshold
  const updatedSession = await prisma.session.update({
    where: { id: session.id },
    data: {
      lastActiveAt: new Date(),
      ...(daysUntilExpiry < REFRESH_THRESHOLD_DAYS && {
        expiresAt: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      }),
    },
    include: { user: true },
  })

  if (daysUntilExpiry < REFRESH_THRESHOLD_DAYS) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_CONFIG.name, token, {
      httpOnly: COOKIE_CONFIG.httpOnly,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: COOKIE_CONFIG.path,
      maxAge: COOKIE_CONFIG.maxAge,
    })
  }

  return updatedSession
}

export async function refreshSession(
  token: string
): Promise<Session | null> {
  try {
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
  } catch {
    return null
  }
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
