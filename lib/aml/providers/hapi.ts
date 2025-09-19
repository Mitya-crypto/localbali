import type { AmlResult } from "./tonapi";

// Skeleton connector. Replace endpoint according to your HAPI AML subscription.
export async function checkWithHapi(addr: string, key?: string): Promise<AmlResult> {
  if (!key) return { risk: "low", reasons: ["HAPI key not configured"] };
  try {
    // Example (pseudo): const r = await fetch(`https://api.hapi.one/v1/ton/address/${addr}`, { headers: { Authorization: `Bearer ${key}` }});
    // const data = await r.json();
    // Map provider score -> risk
    // For now return neutral until configured.
    return { risk: "low", reasons: ["HAPI connector ready (configure endpoint)"] };
  } catch (e: any) {
    return { risk: "low", reasons: ["HAPI fetch error"], raw: { error: String(e) } };
  }
}
