import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles
const protectedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/dashboard': ['engineer', 'manager'],
  '/homeowner': ['homeowner'],
  '/api/admin': ['admin'],
  '/api/projects': ['admin', 'engineer', 'manager', 'homeowner'],
};

function decodeJWTRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const data = JSON.parse(json);
    return typeof data.role === 'string' ? data.role : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('construction-auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Determine if route has role restrictions
  const matchedPrefix = Object.keys(protectedRoutes).find((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  const userRole = decodeJWTRole(token);
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const allowed = protectedRoutes[matchedPrefix];
  if (allowed.includes(userRole)) {
    return NextResponse.next();
  }

  // Redirect to appropriate dashboard based on role
  const redirectMap: Record<string, string> = {
    admin: '/admin',
    engineer: '/dashboard',
    manager: '/dashboard',
    homeowner: '/homeowner',
  };
  return NextResponse.redirect(
    new URL(redirectMap[userRole] || '/login', request.url)
  );
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
    '/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)',
  ],
};
