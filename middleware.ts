import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes and their allowed roles
const protectedRoutes = {
  "/admin": ["admin"],
  "/dashboard": ["engineer", "manager"],
  "/homeowner": ["homeowner"],
  "/api/admin": ["admin"],
  "/api/projects": ["admin", "engineer", "manager", "homeowner"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("construction-auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Basic token validation - for full verification, we'll rely on API routes
    if (!token || token.length < 10) {
      throw new Error("Invalid token")
    }

    // For now, allow all authenticated users through
    // Role-based checks will be handled in individual API routes and components
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login (login endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)",
  ],
}
