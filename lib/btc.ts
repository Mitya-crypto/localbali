export type BtcBalance = { confirmed: number; unconfirmed: number; total: number }; // сатоши

export async function fetchBtcBalance(addr: string): Promise<BtcBalance> {
  // 1) Blockstream
  try{
    const r = await fetch(`https://blockstream.info/api/address/${addr}`, { cache:'no-store' });
    if(r.ok){
      const j = await r.json();
      const conf = (j?.chain_stats?.funded_txo_sum || 0) - (j?.chain_stats?.spent_txo_sum || 0);
      const mem  = (j?.mempool_stats?.funded_txo_sum || 0) - (j?.mempool_stats?.spent_txo_sum || 0);
      return { confirmed: conf, unconfirmed: mem, total: conf + mem };
    }
  }catch{}

  // 2) BlockCypher
  try{
    const r = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${addr}/balance`, { cache:'no-store' });
    if(r.ok){
      const j = await r.json();
      const final_bal = Number(j?.final_balance || 0); // сатоши
      const unconf = Number(j?.unconfirmed_balance || 0);
      return { confirmed: final_bal - unconf, unconfirmed: unconf, total: final_bal };
    }
  }catch{}

  // 3) Blockchain.com
  try{
    const r = await fetch(`https://blockchain.info/rawaddr/${addr}?cors=true`, { cache:'no-store' });
    if(r.ok){
      const j = await r.json();
      const final_bal = Number(j?.final_balance || 0);
      return { confirmed: final_bal, unconfirmed: 0, total: final_bal };
    }
  }catch{}

  return { confirmed: 0, unconfirmed: 0, total: 0 };
}

export const satsToBtc = (sats:number)=> sats/1e8;
