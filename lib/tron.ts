/** TronLink + USDT(TRC20) helpers (client-only) */
export const USDT_TRON_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

declare global { interface Window { tronLink?: any; tronWeb?: any; } }

const T58 = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export function isTronInjected(): boolean {
  return typeof window !== 'undefined' && !!(window.tronWeb || window.tronLink);
}

async function waitForLoad(){
  if (typeof window==='undefined') return;
  if (document.readyState === 'complete') return;
  await new Promise<void>(res => window.addEventListener('load', ()=>res(), { once:true }));
}

/** ждём инъекцию TronLink/TronWeb (до 15с) */
export async function ensureTronInjected(timeoutMs = 15000): Promise<void> {
  if (typeof window === 'undefined') throw new Error('window is undefined');
  await waitForLoad();
  if (isTronInjected()) return;

  let ready = false;
  const onInit = () => { ready = true; };
  window.addEventListener('tronLink#initialized', onInit, { once: true });

  const start = Date.now();
  while (!ready && Date.now() - start < timeoutMs) {
    if (isTronInjected()) break;
    await wait(100);
  }
  window.removeEventListener('tronLink#initialized', onInit);

  if (!isTronInjected()) {
    throw new Error('TronLink не найден. Установите расширение и перезагрузите страницу.');
  }
}

/** запросить доступ и вернуть адрес {base58, hex?} — ждём появления адреса до 12с */
export async function connectTronLink(): Promise<{ address: string; hex?: string }> {
  await ensureTronInjected();
  const { tronLink, tronWeb } = window;
  let reqErr: any = null;

  try {
    if (tronLink?.request) {
      await tronLink.request({ method: 'tron_requestAccounts' });
    } else if (tronLink?.requestAccounts) {
      await tronLink.requestAccounts();
    }
  } catch (e:any) {
    reqErr = e;
  }

  const start = Date.now();
  while (Date.now() - start < 12000) {
    const base58 = tronWeb?.defaultAddress?.base58;
    if (base58 && T58.test(base58)) {
      return { address: base58, hex: tronWeb?.defaultAddress?.hex };
    }
    await wait(120);
  }

  const status = window.tronWeb?.ready ? 'ready' : 'not-ready';
  const errMsg = reqErr?.message || 'нет разрешения/кошелёк заблокирован/сайт не подключён';
  throw new Error(`Не удалось получить адрес Tron из TronLink: ${errMsg} (tronWeb ${status}). Откройте расширение TronLink → подключите сайт http://localhost:3010 и разблокируйте кошелёк.`);
}

/** подписка на смену аккаунта TronLink; off() */
export function onTronAccountChanged(handler: (addrBase58: string | null) => void): () => void {
  const msgHandler = (ev: MessageEvent) => {
    const d: any = (ev && (ev as any).data) || null;
    const action = d?.message?.action || d?.action;
    if (action === 'setAccount' || action === 'accountsChanged') {
      const a = d?.message?.data?.address ?? d?.data?.address ?? null;
      handler(a && T58.test(a) ? a : null);
    }
  };
  window.addEventListener('message', msgHandler);

  let last: string | null = null;
  const iv = window.setInterval(() => {
    try{
      const a: string | undefined = window.tronWeb?.defaultAddress?.base58;
      if (a && T58.test(a) && a !== last) {
        last = a; handler(a);
      }
    }catch{}
  }, 1000);

  return () => { window.removeEventListener('message', msgHandler); window.clearInterval(iv); };
}

/** баланс USDT(TRC20) в токенах */
export async function getUsdtBalance(addressBase58: string): Promise<number> {
  await ensureTronInjected();
  const tw = window.tronWeb;
  const c = await tw.contract().at(USDT_TRON_CONTRACT);
  const raw = await c.balanceOf(addressBase58).call();
  const asStr =
    raw?._hex ? tw.toBigNumber(raw._hex).toString(10)
    : typeof raw?.toString === 'function' ? raw.toString()
    : typeof raw === 'number' ? String(raw) : '0';
  const dec = 6;
  const whole = Number(asStr) / 10 ** dec;
  return Number.isFinite(whole) ? whole : 0;
}

export function shortTron(addr: string){ return addr.length>12 ? addr.slice(0,6)+'…'+addr.slice(-4) : addr; }
