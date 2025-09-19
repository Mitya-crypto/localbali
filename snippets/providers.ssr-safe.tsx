'use client';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { I18nProvider } from '../lib/i18n';

const queryClient = new QueryClient();
const wagmiConfig = createConfig({ chains:[mainnet], transports:{ [mainnet.id]: http() } });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>{children}</I18nProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </ThemeProvider>
  );
}
