import { NextResponse } from 'next/server';

// Public, unauthenticated health check.
export async function GET() {
  return NextResponse.json({ ok: true });
}
