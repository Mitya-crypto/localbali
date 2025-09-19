import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API = 'https://apilist.tronscanapi.com/api/account/tokens';
const USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT (TRC20)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }
    // show=1 -> TRC20 only, hidden=1 -> не фильтровать мелкие, token=USDT -> сузить до USDT
    const url = `${API}?address=${address}&start=0&limit=200&hidden=1&show=1&token=${USDT}&assetType=1`;
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (!r.ok) {
      return NextResponse.json({ error: 'upstream error', status: r.status }, { status: 502 });
    }
    const data = await r.json();
    let usdt = 0;
    const item = Array.isArray(data?.data) ? data.data.find((x: any) => x?.tokenId === USDT) : null;
    if (item) {
      const dec = Number(item.tokenDecimal ?? 6);
      const raw = (item.balance ?? item.quantity ?? '0').toString();
      usdt = Number(raw) / 10 ** dec;
      if (!Number.isFinite(usdt)) usdt = 0;
    }
    return NextResponse.json({ usdt });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unexpected' }, { status: 500 });
  }
}
