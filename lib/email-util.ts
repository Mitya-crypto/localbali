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

const API_START = '/api/email/verification/start';
const API_CONFIRM = '/api/email/verification/confirm';

export type StartVerificationOptions = {
  ttlSeconds?: number;
  userId?: string;
  signal?: AbortSignal;
};

export type StartVerificationResult = {
  ok: boolean;
  expiresAt?: number;
  resendAfter?: number;
  debugCode?: string;
  error?: string;
  retryAfter?: number;
};

export async function startVerification(
  email: string,
  ttlOrOptions?: number | StartVerificationOptions,
  maybeOptions?: StartVerificationOptions
): Promise<StartVerificationResult> {
  let options: StartVerificationOptions = {};
  if (typeof ttlOrOptions === 'number') {
    options = { ...maybeOptions, ttlSeconds: ttlOrOptions };
  } else if (typeof ttlOrOptions === 'object' && ttlOrOptions) {
    options = ttlOrOptions;
  }

  const payload: Record<string, unknown> = { email: email.trim() };
  if (typeof options.ttlSeconds === 'number') payload.ttlSeconds = options.ttlSeconds;
  if (options.userId) payload.userId = options.userId;

  try {
    const res = await fetch(API_START, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: options.signal,
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) {
      return {
        ok: false,
        error: typeof data?.error === 'string' ? data.error : 'server-error',
        retryAfter:
          typeof data?.retryAfter === 'number' ? Number(data.retryAfter) : undefined,
      };
    }
    return {
      ok: true,
      expiresAt: typeof data?.expiresAt === 'number' ? Number(data.expiresAt) : undefined,
      resendAfter:
        typeof data?.resendAfter === 'number' ? Number(data.resendAfter) : undefined,
      debugCode: typeof data?.debugCode === 'string' ? data.debugCode : undefined,
    };
  } catch (err) {
    return { ok: false, error: 'network-error' };
  }
}

export type VerifyCodeOptions = {
  userId?: string;
  signal?: AbortSignal;
};

export type EmailProfile = {
  email?: string;
  emailVerified: boolean;
  verifiedAt?: number;
};

export type VerifyCodeResult = {
  ok: boolean;
  error?: string;
  attemptsLeft?: number;
  profile?: EmailProfile;
};

export async function verifyCode(
  email: string,
  code: string,
  options: VerifyCodeOptions = {}
): Promise<VerifyCodeResult> {
  const payload: Record<string, unknown> = {
    email: email.trim(),
    code: code.trim(),
  };
  if (options.userId) payload.userId = options.userId;

  try {
    const res = await fetch(API_CONFIRM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: options.signal,
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) {
      return {
        ok: false,
        error: typeof data?.error === 'string' ? data.error : 'server-error',
        attemptsLeft:
          typeof data?.attemptsLeft === 'number'
            ? Number(data.attemptsLeft)
            : undefined,
      };
    }
    let profile: EmailProfile | undefined;
    if (data?.profile && typeof data.profile === 'object') {
      profile = {
        email:
          typeof data.profile.email === 'string'
            ? data.profile.email
            : undefined,
        emailVerified: Boolean(data.profile.emailVerified),
        verifiedAt:
          typeof data.profile.verifiedAt === 'number'
            ? Number(data.profile.verifiedAt)
            : undefined,
      };
    }
    return { ok: true, profile };
  } catch (err) {
    return { ok: false, error: 'network-error' };
  }
}

const LS = {
  verified: 'userEmailVerified',
  user: 'userEmail',
};

export function getEmail(): { email?:string; verified:boolean } {
  const email = localStorage.getItem(LS.user) || undefined;
  const verified = localStorage.getItem(LS.verified) === '1';
  return { email, verified };
}
