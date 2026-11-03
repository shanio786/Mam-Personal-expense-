import 'server-only';

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { getServiceClient } from '@/lib/supabase';
import type { User } from '@/types/database';

/**
 * Authentication for the single-user expense-manager app.
 *
 * Everything here is server-only (the `server-only` import above guarantees this
 * module can never be bundled into client code). There is exactly one user
 * account, one password, and one session cookie. No roles, no permissions.
 *
 * The session is a JWT (HS256, signed with JWT_SECRET) stored in an httpOnly
 * cookie named "session". The JWT's subject is the user's id.
 */

const COOKIE_NAME = 'session';
const JWT_ALG = 'HS256';

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;
const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing environment variable: JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
}

/** Hash a plaintext password with bcrypt (10 rounds). */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Verify a plaintext password against a bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a session for the single user account and set the session cookie.
 *
 * Expiry is 90 days when "remember me" is checked, otherwise 7 days. The cookie
 * maxAge matches the JWT expiry.
 */
export async function createSession(rememberMe: boolean): Promise<void> {
  // Single-user app: bind the session to the one and only user row.
  const supabase = getServiceClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!user) throw new Error('No user account exists. Run scripts/setup-user.ts first.');

  const maxAge = rememberMe ? NINETY_DAYS_SECONDS : SEVEN_DAYS_SECONDS;
  const nowSeconds = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(user.id)
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + maxAge)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

/**
 * Read and verify the session cookie. Returns the user row, or null if there is
 * no valid session (missing/expired/invalid token, or the user no longer exists).
 */
export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  let userId: string | undefined;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: [JWT_ALG] });
    userId = typeof payload.sub === 'string' ? payload.sub : undefined;
  } catch {
    return null;
  }
  if (!userId) return null;

  const supabase = getServiceClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !user) return null;
  return user as User;
}

/**
 * Return the current user or throw. For use in server components and route
 * handlers that must have an authenticated user.
 */
export async function requireSession(): Promise<User> {
  const user = await getSession();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/** Clear the session cookie. */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
