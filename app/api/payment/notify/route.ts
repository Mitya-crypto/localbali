import { NextResponse } from "next/server";
import { memdb } from "@/lib/memdb";

export const runtime = "nodejs";

function percentForLevel(l: number) {
  return l === 2 ? 30 : l === 1 ? 20 : 10; // 0→10%, 1→20%, 2→30%
}

export async function POST(req: Request) {
  const { payerId, amount, commission, currency = "USD", paymentId } =
    await req.json().catch(() => ({}));

  if (!payerId || typeof commission !== "number") {
    return NextResponse.json({ ok: false, error: "bad params" }, { status: 400 });
  }

  const referrerId = memdb.links.get(String(payerId)) || null;
  let level = 0, percent = 0, payout = 0;

  if (referrerId) {
    level = memdb.levels.get(String(referrerId)) ?? 0;
    percent = percentForLevel(level);
    payout = +(commission * (percent / 100)).toFixed(6);
  }

  // TODO: здесь делаем реальную выплату на кошелек пригласившего
  // (TON, USDT и т.п.) и пишем транзакцию в БД.

  return NextResponse.json({
    ok: true,
    paymentId: paymentId || null,
    currency,
    amount,
    commission,
    referrerId,
    level,
    percent,
    payout
  });
}
