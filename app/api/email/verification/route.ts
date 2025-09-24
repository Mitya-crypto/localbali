import { NextResponse } from 'next/server';
import { getEmailStatus, resolveUserId, startEmailVerification } from '@/lib/email-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(searchParams.get('userId') ?? undefined);
  const status = getEmailStatus(userId);
  return NextResponse.json({ ok: true, status });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const { email, userId, ttlSeconds, ttl } = payload ?? {};
  const result = await startEmailVerification(userId, email, ttlSeconds ?? ttl);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
