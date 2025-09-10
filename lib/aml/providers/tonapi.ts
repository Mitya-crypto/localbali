export type AmlResult = { risk: "low" | "medium" | "high"; reasons: string[]; raw?: any };

export async function checkWithTonapi(addr: string, key?: string): Promise<AmlResult> {
  const blocked = (process.env.DEMO_BLOCKED || "").split(",").map(s => s.trim()).filter(Boolean);
  if (blocked.includes(addr)) {
    return { risk: "high", reasons: ["Address in DEMO_BLOCKED list"] };
  }
  // Try to fetch some public context from tonapi if key provided (endpoint may need adjustment per plan).
  if (!key) return { risk: "low", reasons: ["No issues detected (tonapi-lite)"] };
  try {
    const r = await fetch(`https://tonapi.io/v2/accounts/${addr}/labels`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${key}` }
    });
    if (!r.ok) {
      return { risk: "low", reasons: [`tonapi.io ${r.status} (labels)`] };
    }
    const data = await r.json();
    const labels: string[] = (data?.labels || []).map((l: any) => l.name || l);
    const reasons: string[] = [];
    let risk: AmlResult["risk"] = "low";
    const lower = labels.map(x => String(x).toLowerCase());
    if (lower.some(x => x.includes("scam") || x.includes("fraud"))) { risk = "high"; reasons.push("Label: scam/fraud"); }
    if (lower.some(x => x.includes("mixer"))) { risk = "high"; reasons.push("Label: mixer"); }
    if (lower.some(x => x.includes("gambling") || x.includes("casino"))) { risk = risk === "high" ? "high" : "medium"; reasons.push("Label: gambling"); }
    if (reasons.length === 0) reasons.push("No risky labels found");
    return { risk, reasons, raw: { labels } };
  } catch (e: any) {
    return { risk: "low", reasons: ["Tonapi fetch error"], raw: { error: String(e) } };
  }
}
