import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    ok: true,
    pairs: [
      { symbol: "TEST/USDT", price: "1.23" },
      { symbol: "DEMO/SOL",  price: "0.045" },
    ],
  });
}
