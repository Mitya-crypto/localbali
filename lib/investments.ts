export type Tx = {
  id: string;
  ts: number;               // timestamp (ms)
  kind: 'buy'|'sell'|'expense'|'income';
  asset?: string;           // тикер (для buy/sell)
  amount?: number;          // количество (для buy/sell)
  valueRub: number;         // ₽ на момент сделки/операции
  note?: string;
};

export type WatchItem = { symbol: string };
export type Goals = { monthlyBudgetRub: number };
export type Risk = { score: number }; // 0..100
export type InvState = {
  txs: Tx[];
  watch: WatchItem[];
  goals: Goals;
  risk: Risk;
  cashRub: number; // условный кэш (руб) — пополняется income, уменьшается на expense/buy, растёт при sell
};

const K_TXS   = 'inv.v1.txs';
const K_WATCH = 'inv.v1.watch';
const K_GOALS = 'inv.v1.goals';
const K_RISK  = 'inv.v1.risk';
const K_CASH  = 'inv.v1.cash';

function safe<T>(k: string, def: T): T {
  if (typeof window==='undefined') return def;
  try { const raw = localStorage.getItem(k); return raw ? { ...def, ...JSON.parse(raw) } : def; } catch { return def; }
}
function readArr<T>(k:string): T[] {
  if (typeof window==='undefined') return [];
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) as T[] : []; } catch { return []; }
}
function write(k:string, v:any){ if(typeof window!=='undefined') localStorage.setItem(k, JSON.stringify(v)); }

export function getState(): InvState {
  const txs = readArr<Tx>(K_TXS);
  const watch = readArr<WatchItem>(K_WATCH);
  const goals = safe<Goals>(K_GOALS, { monthlyBudgetRub: 0 });
  const risk  = safe<Risk>(K_RISK, { score: 40 });
  const cashRub = (typeof window!=='undefined') ? Number(localStorage.getItem(K_CASH)||'0') : 0;
  return { txs, watch, goals, risk, cashRub };
}

export function addTx(tx: Omit<Tx,'id'|'ts'> & { ts?: number }) {
  const s = getState();
  const full: Tx = { id: Math.random().toString(36).slice(2), ts: tx.ts ?? Date.now(), ...tx };
  const txs = [full, ...s.txs];
  write(K_TXS, txs);
  let cash = s.cashRub;
  if (full.kind==='income') cash += full.valueRub;
  if (full.kind==='expense') cash -= full.valueRub;
  if (full.kind==='buy') cash -= full.valueRub;
  if (full.kind==='sell') cash += full.valueRub;
  localStorage.setItem(K_CASH, String(Math.max(0, Math.round(cash))));
  return full;
}

export function setBudgetRub(v:number){ const g = { ...getState().goals, monthlyBudgetRub: Math.max(0, Math.round(v||0)) }; write(K_GOALS, g); }
export function setRiskScore(v:number){ const r = { score: Math.min(100, Math.max(0, Math.round(v||0))) }; write(K_RISK, r); }
export function addWatch(symbol:string){ const s = getState(); const w = [...s.watch.filter(i=>i.symbol!==symbol.toUpperCase()), {symbol:symbol.toUpperCase()}]; write(K_WATCH, w); }
export function removeWatch(symbol:string){ const s = getState(); write(K_WATCH, s.watch.filter(i=>i.symbol!==symbol.toUpperCase())); }

export function monthKey(ts:number){ const d=new Date(ts); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }

export function monthlySpendRub(ts=Date.now()){
  const mk = monthKey(ts);
  return getState().txs.filter(t=>{
    const k = monthKey(t.ts);
    return k===mk && (t.kind==='expense' || t.kind==='buy');
  }).reduce((a,t)=>a+Math.max(0, t.valueRub||0),0);
}

export function positions(){ // грубая агрегация по тикерам
  const map = new Map<string,{qty:number,costRub:number, valueRub:number}>();
  for(const t of getState().txs){
    if(t.kind==='buy' && t.asset){
      const cur=map.get(t.asset)||{qty:0,costRub:0,valueRub:0};
      cur.qty += t.amount||0;
      cur.costRub += t.valueRub||0;
      cur.valueRub += t.valueRub||0;
      map.set(t.asset, cur);
    }
    if(t.kind==='sell' && t.asset){
      const cur=map.get(t.asset)||{qty:0,costRub:0,valueRub:0};
      cur.qty -= t.amount||0;
      cur.valueRub -= t.valueRub||0;
      map.set(t.asset, cur);
    }
  }
  return Array.from(map.entries()).map(([asset, v])=>({asset, ...v})).filter(p=>p.qty>0 || p.valueRub>0);
}

export function totals(){
  const s = getState();
  const heldRub = positions().reduce((a,p)=>a + Math.max(0,p.valueRub), 0);
  const totalRub = Math.max(0, Math.round(s.cashRub + heldRub));
  const weights = positions().map(p=>({ asset:p.asset, w: totalRub ? (Math.max(0,p.valueRub)/totalRub) : 0 }));
  return { totalRub, cashRub: s.cashRub, heldRub, weights };
}
