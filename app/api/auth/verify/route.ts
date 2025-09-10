import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

type InitData = Record<string, string>;

function parseInitData(str: string): InitData {
  const data: InitData = {};
  for (const [k, v] of new URLSearchParams(str)) data[k] = v;
  return data;
}

function checkTelegramAuth(initData: string, botToken: string): boolean {
  const data = parseInitData(initData);
  const hash = data.hash;
  delete data.hash;
  if (!hash) return false;

  const sorted = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calc = crypto.createHmac("sha256", secret).update(sorted).digest("hex");

  return calc === hash;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const initData = searchParams.get("initData") ?? "";
  const BOT_TOKEN = process.env.BOT_TOKEN ?? "";

  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "missing BOT_TOKEN" }, { status: 500 });
  }
  if (!initData) {
    return NextResponse.json({ ok: false, error: "missing initData" }, { status: 400 });
  }

  const ok = checkTelegramAuth(initData, BOT_TOKEN);
  return NextResponse.json({ ok });
}
