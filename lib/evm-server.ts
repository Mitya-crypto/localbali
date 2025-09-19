import { createPublicClient, http, formatEther } from 'viem';

type ChainId = 1 | 56 | 137 | 42161 | 10;

const RPC: Record<ChainId, string> = {
  1:     'https://eth.llamarpc.com',
  56:    'https://bsc-dataseed.binance.org',
  137:   'https://polygon-rpc.com',
  42161: 'https://arb1.arbitrum.io/rpc',
  10:    'https://mainnet.optimism.io',
};

const USDT: Record<ChainId, `0x${string}`> = {
  1:     '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  56:    '0x55d398326f99059fF775485246999027B3197955',
  137:   '0xC2132D05D31c914A87C6611C10748AEb04B58e8F',
  42161: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  10:    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
};

const ERC20_BALANCE_OF_SIG = '0x70a08231'; // keccak('balanceOf(address)') first 4 bytes

export async function readEthBalance(address: `0x${string}`, chainId: ChainId){
  const client = createPublicClient({ transport: http(RPC[chainId]) });
  const wei = await client.getBalance({ address });
  return Number(formatEther(wei)); // ETH / BNB / MATIC ... в базовой валюте сети
}

export async function readUsdtBalance(address: `0x${string}`, chainId: ChainId){
  const client = createPublicClient({ transport: http(RPC[chainId]) });
  const data = ERC20_BALANCE_OF_SIG + address.slice(2).padStart(64, '0');
  const raw = await client.call({
    to: USDT[chainId],
    data: data as `0x${string}`,
  });
  // USDT обычно 6 знаков
  const hex = raw.data || '0x0';
  const val = BigInt(hex);
  return Number(val) / 1e6;
}

export function isSupportedChain(c: number): c is ChainId {
  return c===1 || c===56 || c===137 || c===42161 || c===10;
}
