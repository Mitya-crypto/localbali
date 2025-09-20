import { NextResponse } from 'next/server';
import { confirmEmailCode, getEmailStatus, resolveUserId } from '@/lib/email-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const { code, userId } = payload ?? {};
  const resolvedUserId = resolveUserId(userId);
  if (typeof code !== 'string' || !code.trim()) {
    return NextResponse.json(
      {
        ok: false as const,
        error: 'missing-code',
        message: 'Укажите код подтверждения.',
        status: getEmailStatus(resolvedUserId),
      },
      { status: 400 },
    );
  }
  const result = confirmEmailCode(resolvedUserId, code);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
