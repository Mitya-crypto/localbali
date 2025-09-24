import { NextResponse } from "next/server";
import nodemailer, { Transporter } from "nodemailer";
import { memdb } from "@/lib/memdb";
import { validateEmailFormat } from "@/lib/email-util";

export const runtime = "nodejs";

const DEFAULT_TTL = 600;
const MIN_TTL = 60;
const MAX_TTL = 1800;
const COOLDOWN_MS = 30_000;
const CODE_LENGTH = 6;
const EMAIL_DEBUG = process.env.EMAIL_DEBUG === "1";

let cachedTransporter: Transporter | null = null;

function buildTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const url = process.env.SMTP_URL;
  if (url) {
    cachedTransporter = nodemailer.createTransport(url);
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE
    ? ["1", "true", "yes"].includes(String(process.env.SMTP_SECURE).toLowerCase())
    : port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass: pass || "" } : undefined,
  });
  return cachedTransporter;
}

function sessionKey(userId: string | undefined, email: string): string {
  return `${userId ? String(userId) : "anon"}::${email.toLowerCase()}`;
}

function generateCode(len = CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < len; i += 1) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

function resolveFromAddress(): string | null {
  const explicit = process.env.SMTP_FROM;
  if (explicit) return explicit;

  const email = process.env.SMTP_USER || process.env.SMTP_FROM_EMAIL;
  if (!email) return null;
  const name = process.env.SMTP_FROM_NAME;
  return name ? `${name} <${email}>` : email;
}

export async function POST(req: Request) {
  const transport = buildTransporter();
  const from = resolveFromAddress();
  if (!transport || !from) {
    return NextResponse.json(
      { ok: false, error: "smtp-not-configured" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const userId = body.userId ? String(body.userId) : undefined;
  const ttlRaw = Number(body.ttlSeconds ?? DEFAULT_TTL);

  if (!validateEmailFormat(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid-email" },
      { status: 400 }
    );
  }

  const ttlSeconds = Math.min(
    Math.max(Number.isFinite(ttlRaw) ? Math.floor(ttlRaw) : DEFAULT_TTL, MIN_TTL),
    MAX_TTL
  );

  const key = sessionKey(userId, email);
  const now = Date.now();
  const existing = memdb.emailSessions.get(key);
  if (existing && now - existing.createdAt < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - (now - existing.createdAt)) / 1000);
    return NextResponse.json(
      { ok: false, error: "rate-limited", retryAfter },
      { status: 429 }
    );
  }

  const code = generateCode();
  const expiresAt = now + ttlSeconds * 1000;

  memdb.emailSessions.set(key, {
    email,
    code,
    expiresAt,
    attempts: 0,
    userId,
    createdAt: now,
  });

  const timeout = setTimeout(() => {
    const session = memdb.emailSessions.get(key);
    if (session && session.code === code) {
      memdb.emailSessions.delete(key);
    }
  }, ttlSeconds * 1000);
  if (typeof (timeout as any).unref === "function") {
    (timeout as any).unref();
  }

  const minutes = Math.max(1, Math.round(ttlSeconds / 60));
  const subject = "Код подтверждения e-mail";
  const text = `Ваш код подтверждения: ${code}. Он действует ${minutes} мин.`;
  const html = `<p>Ваш код подтверждения:</p><p style="font-size:24px; letter-spacing:8px;"><strong>${code}</strong></p><p>Срок действия: ${minutes} мин.</p>`;

  try {
    await transport.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
    });
  } catch (err) {
    memdb.emailSessions.delete(key);
    return NextResponse.json(
      { ok: false, error: "smtp-error", detail: String(err) },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    expiresAt,
    resendAfter: Math.ceil(COOLDOWN_MS / 1000),
    debugCode: EMAIL_DEBUG ? code : undefined,
  });
}
