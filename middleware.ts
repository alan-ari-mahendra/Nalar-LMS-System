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

// Role-based route protection is handled server-side via requireRole()
// in each page's server component. Middleware only checks session presence
// because Edge Runtime cannot access Prisma DB to resolve session → role.

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
