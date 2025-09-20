import { randomInt } from 'crypto';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailStatus } from './email-types';
import { memdb, type EmailVerificationSession, type UserRecord } from './memdb';
import { validateEmailFormat } from './email-util';

const DEFAULT_TTL = Number.parseInt(process.env.EMAIL_VERIFICATION_TTL || '600', 10);
const MIN_TTL = 60;
const MAX_TTL = 60 * 60;

export const DEFAULT_USER_ID = 'demo-user';

let transporterCache: Transporter | null | undefined;

function ensureTransporter(): Transporter | null {
  if (transporterCache !== undefined) return transporterCache;
  const host = process.env.SMTP_HOST;
  if (!host) {
    transporterCache = null;
    return null;
  }
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secureEnv = process.env.SMTP_SECURE?.toLowerCase();
  const secure = secureEnv === '1' || secureEnv === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  transporterCache = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });
  return transporterCache;
}

function randDigits(len = 6): string {
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += randomInt(0, 10).toString(10);
  }
  return out;
}

function cleanupSessions(now = Date.now()) {
  for (const [key, session] of memdb.emailSessions.entries()) {
    if (session.expiresAt <= now) {
      memdb.emailSessions.delete(key);
    }
  }
}

export function resolveUserId(raw?: unknown): string {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  return DEFAULT_USER_ID;
}

export function getEmailStatus(userId: string): EmailStatus {
  cleanupSessions();
  const session = memdb.emailSessions.get(userId);
  const user = memdb.users.get(userId);
  const now = Date.now();
  let pending = false;
  let expiresAt: number | undefined;
  if (session && session.expiresAt > now) {
    pending = true;
    expiresAt = session.expiresAt;
  } else if (session) {
    memdb.emailSessions.delete(userId);
  }
  return {
    email: pending ? session?.email : user?.email,
    verified: Boolean(user?.verified),
    pending,
    expiresAt,
  };
}

function storeSession(userId: string, email: string, ttlSeconds: number): EmailVerificationSession {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const session: EmailVerificationSession = {
    userId,
    email,
    code: randDigits(6),
    expiresAt,
    attempts: 0,
  };
  memdb.emailSessions.set(userId, session);
  return session;
}

function upsertUser(userId: string, email: string, verified: boolean): UserRecord {
  const current = memdb.users.get(userId) ?? { id: userId, verified: false };
  const next: UserRecord = {
    ...current,
    id: userId,
    email,
    verified,
    verifiedAt: verified ? Date.now() : current.verifiedAt,
  };
  memdb.users.set(userId, next);
  return next;
}

async function deliverEmail(email: string, code: string, ttlSeconds: number) {
  const transporter = ensureTransporter();
  const minutes = Math.max(1, Math.round(ttlSeconds / 60));
  const subject = process.env.EMAIL_VERIFICATION_SUBJECT || 'Verification code';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
  const text = `Ваш код подтверждения: ${code}. Он действителен ${minutes} минут.`;
  const html = `<!doctype html><html><body><p>Ваш код подтверждения:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px;">${code}</p><p>Код действителен ${minutes} минут.</p></body></html>`;
  if (!transporter) {
    console.info(`[email] SMTP не настроен. Код для ${email}: ${code}`);
    return { delivered: false, skipped: true, message: 'SMTP не настроен. Код выведен в консоль сервера.' };
  }
  try {
    await transporter.sendMail({ from, to: email, subject, text, html });
    return { delivered: true, skipped: false, message: 'Письмо с кодом отправлено через SMTP.' };
  } catch (error) {
    console.error('[email] Ошибка отправки письма', error);
    return { delivered: false, skipped: false, message: 'Не удалось отправить письмо через SMTP.' };
  }
}

function clampTtl(ttl?: number): number {
  if (!Number.isFinite(ttl) || !ttl) return DEFAULT_TTL;
  return Math.min(MAX_TTL, Math.max(MIN_TTL, Math.floor(ttl)));
}

export async function startEmailVerification(rawUserId: unknown, email: string, ttlSeconds?: number) {
  const userId = resolveUserId(rawUserId);
  const normalized = email?.trim();
  if (!normalized) {
    return {
      ok: false as const,
      error: 'missing-email',
      message: 'Не указан e-mail.',
      status: getEmailStatus(userId),
    };
  }
  if (!validateEmailFormat(normalized)) {
    return {
      ok: false as const,
      error: 'invalid-email',
      message: 'Некорректный e-mail.',
      status: getEmailStatus(userId),
    };
  }
  const ttl = clampTtl(ttlSeconds);
  const session = storeSession(userId, normalized, ttl);
  upsertUser(userId, normalized, false);
  const delivery = await deliverEmail(normalized, session.code, ttl);
  const status = getEmailStatus(userId);
  return {
    ok: true as const,
    status,
    delivered: delivery.delivered,
    skipped: delivery.skipped ?? false,
    message: delivery.message,
  };
}

export function confirmEmailCode(rawUserId: unknown, code: string) {
  const userId = resolveUserId(rawUserId);
  cleanupSessions();
  const session = memdb.emailSessions.get(userId);
  if (!session) {
    return {
      ok: false as const,
      error: 'no-session',
      message: 'Нет активной сессии подтверждения.',
      status: getEmailStatus(userId),
    };
  }
  if (Date.now() > session.expiresAt) {
    memdb.emailSessions.delete(userId);
    return {
      ok: false as const,
      error: 'expired',
      message: 'Срок действия кода истёк.',
      status: getEmailStatus(userId),
    };
  }
  if ((code || '').trim() !== session.code) {
    session.attempts += 1;
    return {
      ok: false as const,
      error: 'mismatch',
      message: 'Код не совпадает.',
      status: getEmailStatus(userId),
    };
  }
  memdb.emailSessions.delete(userId);
  upsertUser(userId, session.email, true);
  const status = getEmailStatus(userId);
  return { ok: true as const, status };
}
