import type { AmlResult } from "./tonapi";

// Skeleton TRM connector. Fill with your TRM API base & key.
export async function checkWithTrm(addr: string, key?: string): Promise<AmlResult> {
  if (!key) return { risk: "low", reasons: ["TRM key not configured"] };
  try {
    // Example (pseudo): const r = await fetch(`https://api.trmlabs.com/ton/address/${addr}`, { headers: { 'X-Api-Key': key } });
    // const data = await r.json();
    // Map their flags -> risk
    return { risk: "low", reasons: ["TRM connector ready (configure endpoint)"] };
  } catch (e: any) {
    return { risk: "low", reasons: ["TRM fetch error"], raw: { error: String(e) } };
  }
}
