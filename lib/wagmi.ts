'use client';
import { createConfig } from 'wagmi';
import { mainnet, polygon, bsc, arbitrum, optimism, base } from 'wagmi/chains';
import { http } from 'viem';

// Минимальная конфигурация: http-транспорт на популярные сети
export const config = createConfig({
  chains: [mainnet, polygon, bsc, arbitrum, optimism, base],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});
