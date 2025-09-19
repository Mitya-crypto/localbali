
// === EVM balances ===
export async function fetchEvmBalance(address: string, chainId: number): Promise<{eth:number; usdt:number}> {
  const r = await fetch(`/api/evm/balance?address=${address}&chainId=${chainId}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'evm api error');
  return { eth: Number(j.eth||0), usdt: Number(j.usdt||0) };
}

// собрать EVM адреса по chainId
export function collectEvmByChain(wallets: WalletRecord[]){
  const by: Record<number, Set<string>> = {};
  for (const w of wallets) {
    if (w.kind==='evm' && w.address) {
      const cid = Number((w as any).chainId || 1);
      by[cid] = by[cid] || new Set<string>();
      by[cid].add(w.address.toLowerCase());
    }
  }
  const out: Record<number, string[]> = {};
  for (const k of Object.keys(by)) out[Number(k)] = [...by[Number(k)]];
  return out;
}
