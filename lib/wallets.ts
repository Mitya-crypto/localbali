import { getEmail } from './email-util';

export type WalletKind = 'evm'|'btc'|'ton'|'tron';

export type WalletRecord = {
  id: string;
  kind: WalletKind;
  address: string;
  chainId?: number;   // для EVM
  connector?: string; // для EVM (название коннектора)
  label?: string;
  ts: number;
};

type Store = Record<string, WalletRecord[]>;

const KEY = 'wallets.v1';

function uid(){ return 'w_'+Math.random().toString(36).slice(2,10)+Date.now().toString(36); }
function readStore(): Store { try{ return JSON.parse(localStorage.getItem(KEY)||'{}') as Store; }catch{ return {}; } }
function writeStore(s: Store){ localStorage.setItem(KEY, JSON.stringify(s)); }

// ————— user scope —————
export function getCurrentUserKey(): string | null {
  const { email, verified } = getEmail();
  return (email && verified) ? email.toLowerCase() : null;
}

export function listWalletsFor(userKey: string): WalletRecord[] {
  const s = readStore(); return s[userKey] || [];
}

// ————— add/update —————
export function addEvmWallet(userKey: string, address: string, chainId: number, connector: string, label?: string){
  const s = readStore();
  const list = s[userKey] || [];
  const addr = address.toLowerCase();
  const exists = list.some(w => w.kind==='evm' && w.address.toLowerCase()===addr && w.chainId===chainId);
  if(!exists){
    list.push({ id: uid(), kind:'evm', address, chainId, connector, label, ts: Date.now() });
    s[userKey] = list; writeStore(s);
  }
  return s[userKey];
}

/** Универсальное добавление для любых видов, включая 'tron' */
export function addManualWallet(userKey: string, kind: WalletKind, address: string, label?: string){
  const s = readStore();
  const list = s[userKey] || [];
  const norm = (kind==='evm') ? address.toLowerCase() : address;
  const exists = list.some(w => {
    const a = (w.kind==='evm') ? w.address.toLowerCase() : w.address;
    return w.kind===kind && a===norm;
  });
  if(!exists){
    list.push({ id: uid(), kind, address, label, ts: Date.now() });
    s[userKey] = list; writeStore(s);
  }
  return s[userKey];
}

/** Алиас для Tron — оставляем для удобства, чтобы код, который его вызывает, работал */
export function addTronWallet(userKey: string, address: string, label = 'TRON'){
  return addManualWallet(userKey, 'tron', address, label);
}

export function removeWallet(userKey: string, id: string){
  const s = readStore();
  s[userKey] = (s[userKey]||[]).filter(w => w.id !== id);
  writeStore(s);
  return s[userKey];
}
