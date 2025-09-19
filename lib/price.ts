async function geckoRub(): Promise<number|null>{
  try{
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=rub', { cache:'no-store' });
    if(!r.ok) return null;
    const j = await r.json();
    const v = Number(j?.bitcoin?.rub);
    return Number.isFinite(v) ? v : null;
  }catch{ return null; }
}
async function coindeskUsd(): Promise<number|null>{
  try{
    const r = await fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json', { cache:'no-store' });
    if(!r.ok) return null;
    const j = await r.json();
    const v = Number(j?.bpi?.USD?.rate_float);
    return Number.isFinite(v) ? v : null;
  }catch{ return null; }
}
async function usdToRub(): Promise<number|null>{
  try{
    const r = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=RUB', { cache:'no-store' });
    if(!r.ok) return null;
    const j = await r.json();
    const v = Number(j?.rates?.RUB);
    return Number.isFinite(v) ? v : null;
  }catch{ return null; }
}

export async function getBtcRub(): Promise<number|null>{
  // 1) CoinGecko напрямую в RUB
  const g = await geckoRub();
  if(g) return g;

  // 2) CoinDesk (USD) * курс USD→RUB
  const [usd, fx] = await Promise.all([coindeskUsd(), usdToRub()]);
  if(usd && fx) return usd * fx;

  return null; // не удалось — покажем "—"
}
