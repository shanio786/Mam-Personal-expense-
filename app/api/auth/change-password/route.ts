import { NextResponse } from 'next/server';

import { getServiceClient } from '@/lib/supabase';
import { getSession, verifyPassword, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const { currentPassword, newPassword } = (body ?? {}) as {
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const currentOk = await verifyPassword(currentPassword, user.password_hash);
  if (!currentOk) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 },
    );
  }

  const newHash = await hashPassword(newPassword);
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Could not update password' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
