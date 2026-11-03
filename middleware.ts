import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Auth middleware.
 *
 * Runs on the Edge runtime, so it only verifies the session JWT with `jose`.
 * It never imports bcryptjs or the Supabase service client (those are Node-only
 * and live behind the API routes / lib/auth.ts).
 *
 * - Pages: unauthenticated requests redirect to /login.
 * - API routes: unauthenticated requests return 401 JSON (no redirect).
 * - An authenticated user hitting /login is redirected to /.
 */

const COOKIE_NAME = 'session';
const JWT_ALG = 'HS256';

// Paths reachable without a session. Everything else is protected.
const PUBLIC_PATHS = new Set<string>(['/login', '/api/auth/login', '/api/health']);

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing environment variable: JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
}

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey(), { algorithms: [JWT_ALG] });
    return true;
  } catch {
    // Invalid/expired token, or JWT_SECRET missing — treat as unauthenticated.
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = await hasValidSession(token);

  // Authenticated users should not see the login page.
  if (pathname === '/login') {
    if (authenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Other public paths are always allowed.
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (authenticated) {
    return NextResponse.next();
  }

  // Unauthenticated from here on.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on everything except Next.js internals, the favicon, and any path that
  // looks like a static asset (contains a dot, e.g. .svg, .png, .ico, .js).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
