import { NextRequest, NextResponse } from "next/server";
import { checkWithTonapi } from "@/lib/aml/providers/tonapi";
import { checkWithHapi } from "@/lib/aml/providers/hapi";
import { checkWithTrm } from "@/lib/aml/providers/trm";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";
  if (!address) return NextResponse.json({ error: "address param required" }, { status: 400 });

  const provider = (process.env.AML_PROVIDER || "tonapi").toLowerCase();
  let res;
  if (provider === "trm") res = await checkWithTrm(address, process.env.AML_TRM_KEY);
  else if (provider === "hapi") res = await checkWithHapi(address, process.env.AML_HAPI_KEY);
  else res = await checkWithTonapi(address, process.env.AML_TONAPI_KEY);

  return NextResponse.json({ address, provider, ...res });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const address = String(body.address || "");
  if (!address) return NextResponse.json({ error: "address is required" }, { status: 400 });
  const provider = (process.env.AML_PROVIDER || "tonapi").toLowerCase();
  let res;
  if (provider === "trm") res = await checkWithTrm(address, process.env.AML_TRM_KEY);
  else if (provider === "hapi") res = await checkWithHapi(address, process.env.AML_HAPI_KEY);
  else res = await checkWithTonapi(address, process.env.AML_TONAPI_KEY);
  return NextResponse.json({ address, provider, ...res });
}
