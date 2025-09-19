import { NextResponse } from "next/server";
import { memdb } from "@/lib/memdb";
export const runtime = "nodejs";
export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const level = userId ? memdb.levels.get(String(userId)) ?? 0 : 0;
  return NextResponse.json({ ok:true, userId, level });
}
export async function POST(req: Request) {
  const { userId, level } = await req.json().catch(() => ({}));
  if (!userId || ![0,1,2].includes(Number(level))) {
    return NextResponse.json({ ok: false, error: "bad params" }, { status: 400 });
  }
  memdb.levels.set(String(userId), Number(level));
  return NextResponse.json({ ok: true });
}
