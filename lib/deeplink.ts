export function buildTonDeeplink(to: string, amountTon?: string, comment?: string) {
  const base = `ton://transfer/${encodeURIComponent(to)}`;
  const params = new URLSearchParams();
  if (amountTon) {
    // amount in TON -> nanoton integer string
    const nano = BigInt(Math.round(parseFloat(amountTon) * 1e9)).toString();
    params.set("amount", nano);
  }
  if (comment) params.set("text", comment);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// Not standardized across all wallets. Tonkeeper supports jetton param.
export function buildJettonDeeplink(masterJetton: string, to: string, amount?: string, comment?: string) {
  const url = new URL(`https://app.tonkeeper.com/transfer/${encodeURIComponent(masterJetton)}`);
  url.searchParams.set("address", to);
  if (amount) url.searchParams.set("amount", amount);
  if (comment) url.searchParams.set("text", comment);
  return url.toString();
}
