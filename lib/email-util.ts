import { EmailStatus, type EmailStatusEventDetail } from './email-types';

export function validateEmailFormat(email: string): boolean {
  const e = email.trim();
  if (!e || e.length > 254) return false;
  // либеральная, но строгая проверка RFC 5322-lite
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(e);
}
export function splitEmail(email: string){ 
  const [local, domain] = email.trim().toLowerCase().split('@'); 
  return { local, domain };
}

const KNOWN_PROVIDERS = [
  'gmail.com','yahoo.com','outlook.com','hotmail.com','live.com','icloud.com',
  'proton.me','protonmail.com','gmx.com',
  'yandex.ru','ya.ru','mail.ru','bk.ru','list.ru','inbox.ru','rambler.ru'
];

const DISPOSABLE = [
  'mailinator.com','10minutemail.com','guerrillamail.com','yopmail.com',
  'sharklasers.com','tempmail.dev','getnada.com','temp-mail.org'
];

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE.includes(domain.toLowerCase());
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({length:m+1},(_,i)=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i;
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      const cost = a[i-1]===b[j-1]?0:1;
      dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[m][n];
}

export function suggestDomainFor(email: string): string | null {
  const {domain} = splitEmail(email);
  if(!domain) return null;
  let best: {d:string,dist:number} | null = null;
  for(const d of KNOWN_PROVIDERS){
    const dist = levenshtein(domain, d);
    if(dist <= 2 && (!best || dist < best.dist)) best = {d, dist};
  }
  return best ? best.d : null;
}

const EVENT = 'email-status-change';
const STORAGE = { email: 'userEmail', verified: 'userEmailVerified' };
const DEFAULT_STATUS: EmailStatus = { verified: false, pending: false };

const g = globalThis as any;

function readInitialStatus(): EmailStatus {
  if (typeof window === 'undefined') {
    return (g.__EMAIL_STATUS__ as EmailStatus | undefined) ?? DEFAULT_STATUS;
  }
  try {
    const email = window.localStorage.getItem(STORAGE.email) || undefined;
    const verified = window.localStorage.getItem(STORAGE.verified) === '1';
    return { ...DEFAULT_STATUS, email, verified };
  } catch {
    return DEFAULT_STATUS;
  }
}

if (!g.__EMAIL_STATUS__) {
  g.__EMAIL_STATUS__ = readInitialStatus();
}

let cachedStatus: EmailStatus = g.__EMAIL_STATUS__ as EmailStatus;

function persistStatus(status: EmailStatus) {
  if (typeof window === 'undefined') return;
  try {
    if (status.email) window.localStorage.setItem(STORAGE.email, status.email);
    else window.localStorage.removeItem(STORAGE.email);
    window.localStorage.setItem(STORAGE.verified, status.verified ? '1' : '0');
  } catch {}
}

function emitStatus(status: EmailStatus) {
  cachedStatus = { ...DEFAULT_STATUS, ...status };
  g.__EMAIL_STATUS__ = cachedStatus;
  persistStatus(cachedStatus);
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent<EmailStatusEventDetail>(EVENT, { detail: cachedStatus } as CustomEventInit<EmailStatusEventDetail>),
      );
    } catch {}
  }
  return cachedStatus;
}

type ApiSuccess<T extends object> = { ok: true } & T;
type ApiError = { ok: false; error: string; message?: string; status?: EmailStatus };

async function callApi<T extends object>(url: string, init?: RequestInit): Promise<ApiSuccess<T> | ApiError> {
  try {
    const res = await fetch(url, init);
    const data = (await res.json().catch(() => ({}))) as any;
    const status = data?.status as EmailStatus | undefined;
    if (status) emitStatus(status);
    if (!res.ok || data?.ok === false) {
      return {
        ok: false,
        error: (data?.error as string) || 'server-error',
        message: data?.message as string | undefined,
        status,
      };
    }
    return data as ApiSuccess<T>;
  } catch (error: any) {
    return { ok: false, error: 'network-error', message: error?.message };
  }
}

export function getEmail(): EmailStatus {
  return cachedStatus;
}

export function subscribeEmailStatus(fn: (status: EmailStatus) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: Event) => {
    try {
      const detail = (event as CustomEvent<EmailStatusEventDetail>).detail;
      if (detail) fn(detail);
    } catch {}
  };
  window.addEventListener(EVENT, handler as EventListener);
  return () => window.removeEventListener(EVENT, handler as EventListener);
}

export async function fetchEmailStatus(): Promise<ApiSuccess<{ status: EmailStatus }> | ApiError> {
  return callApi<{ status: EmailStatus }>('/api/email/verification', { method: 'GET', cache: 'no-store' });
}

export async function startVerification(
  email: string,
  ttlSeconds?: number,
): Promise<ApiSuccess<{ status: EmailStatus; delivered: boolean; skipped: boolean; message?: string }> | ApiError> {
  return callApi<{ status: EmailStatus; delivered: boolean; skipped: boolean; message?: string }>(
    '/api/email/verification',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, ttlSeconds }),
    },
  );
}

export async function verifyCode(
  code: string,
): Promise<ApiSuccess<{ status: EmailStatus }> | ApiError> {
  return callApi<{ status: EmailStatus }>('/api/email/verification/confirm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code }),
  });
}
