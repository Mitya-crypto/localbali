import { NextResponse } from "next/server";
import { memdb } from "@/lib/memdb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { referrerId, inviteeId } = await req.json().catch(() => ({}));
  if (!referrerId || !inviteeId || referrerId === inviteeId) {
    return NextResponse.json({ ok: false, error: "bad params" }, { status: 400 });
  }
  if (memdb.links.has(String(inviteeId))) {
    return NextResponse.json({ ok: true, already: true });
  }
  memdb.links.set(String(inviteeId), String(referrerId));
  return NextResponse.json({ ok: true });
}
