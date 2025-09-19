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

function randDigits(len=6): string {
  let s=''; for(let i=0;i<len;i++) s+=Math.floor(Math.random()*10);
  return s;
}

const LS = {
  pending: 'email.pending',
  code: 'email.code',
  exp: 'email.code.exp',
  verified: 'userEmailVerified',
  user: 'userEmail',
};

export function startVerification(email: string, ttlSeconds=600): {code:string, exp:number} {
  const code = randDigits(6);
  const exp = Date.now() + ttlSeconds*1000;
  localStorage.setItem(LS.pending, email.trim());
  localStorage.setItem(LS.code, code);
  localStorage.setItem(LS.exp, String(exp));
  // В реале код отправили бы письмом. В демо вернём его наружу.
  return { code, exp };
}

export function verifyCode(input: string): { ok:boolean; reason?:string } {
  const code = localStorage.getItem(LS.code);
  const exp = Number(localStorage.getItem(LS.exp) || 0);
  const pending = localStorage.getItem(LS.pending) || '';
  if(!code || !exp || !pending) return { ok:false, reason:'no-session' };
  if(Date.now() > exp) return { ok:false, reason:'expired' };
  if(input.trim() !== code) return { ok:false, reason:'mismatch' };
  // успех: переносим e-mail в «подтверждён»
  localStorage.setItem(LS.user, pending);
  localStorage.setItem(LS.verified, '1');
  localStorage.removeItem(LS.pending);
  localStorage.removeItem(LS.code);
  localStorage.removeItem(LS.exp);
  return { ok:true };
}

export function getEmail(): { email?:string; verified:boolean } {
  const email = localStorage.getItem(LS.user) || undefined;
  const verified = localStorage.getItem(LS.verified) === '1';
  return { email, verified };
}
