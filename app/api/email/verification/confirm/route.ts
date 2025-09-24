import { NextResponse } from "next/server";
import { memdb } from "@/lib/memdb";
import { validateEmailFormat } from "@/lib/email-util";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

function sessionKey(userId: string | undefined, email: string): string {
  return `${userId ? String(userId) : "anon"}::${email.toLowerCase()}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const userId = body.userId ? String(body.userId) : undefined;

  if (!validateEmailFormat(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid-email" },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { ok: false, error: "invalid-code" },
      { status: 400 }
    );
  }

  const key = sessionKey(userId, email);
  const session = memdb.emailSessions.get(key);

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "no-session" },
      { status: 404 }
    );
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    memdb.emailSessions.delete(key);
    return NextResponse.json(
      { ok: false, error: "expired" },
      { status: 410 }
    );
  }

  if (session.code !== code) {
    session.attempts += 1;
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - session.attempts);
    if (session.attempts >= MAX_ATTEMPTS) {
      memdb.emailSessions.delete(key);
      return NextResponse.json(
        { ok: false, error: "too-many-attempts" },
        { status: 429 }
      );
    }
    memdb.emailSessions.set(key, session);
    return NextResponse.json(
      { ok: false, error: "mismatch", attemptsLeft },
      { status: 400 }
    );
  }

  memdb.emailSessions.delete(key);

  const ownerKey = userId ? String(userId) : "anon";
  const current = memdb.profiles.get(ownerKey) || { emailVerified: false };
  const verifiedAt = Date.now();

  const profile = {
    ...current,
    email: session.email,
    emailVerified: true,
    verifiedAt,
  };
  memdb.profiles.set(ownerKey, profile);

  return NextResponse.json({ ok: true, profile });
}
