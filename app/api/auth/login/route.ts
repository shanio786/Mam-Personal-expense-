import { NextResponse } from 'next/server';

import { getServiceClient } from '@/lib/supabase';
import { verifyPassword, createSession } from '@/lib/auth';

export const runtime = 'nodejs';

// Generic message used for every failure so the response never reveals whether
// the username or the password was the problem.
const GENERIC_ERROR = 'Wrong username or password';

// A valid bcrypt hash of a random string. When the username does not exist we
// still run a bcrypt comparison against this so that the "no such user" path
// takes roughly as long as the "wrong password" path (no user-enumeration via
// timing).
const DUMMY_HASH = '$2b$10$M/108t41y2OCiVaj20qZX.uPuDq0X3AMlsP63GIvcoUH/r.0Dfu9.';

// Small constant floor on failure response time, so timing does not reveal
// which part was wrong.
const FAILURE_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const { username, password, rememberMe } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
    rememberMe?: unknown;
  };

  if (typeof username !== 'string' || typeof password !== 'string') {
    await delay(FAILURE_DELAY_MS);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  let passwordOk = false;
  if (user) {
    passwordOk = await verifyPassword(password, user.password_hash);
  } else {
    // Equalize timing: do the same bcrypt work even when the user is missing.
    await verifyPassword(password, DUMMY_HASH);
  }

  if (!user || !passwordOk) {
    await delay(FAILURE_DELAY_MS);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await createSession(Boolean(rememberMe));
  return NextResponse.json({ ok: true }, { status: 200 });
}
