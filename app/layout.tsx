// @ts-nocheck
import './globals.css';
import Providers from './providers';
import React from 'react';
import TabBar from '../components/ui/TabBar';
import { Web3Provider } from '../components/providers/Web3';

import TgInit from '../components/providers/TgInit';
import PinGuard from '../components/security/PinGuard';

export const metadata = {
  title: 'CryptoBali — Профиль',
  description: 'Mini-app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TgInit />
        <Web3Provider>
          <Providers>
            {children}
            <PinGuard />
          </Providers>
        </Web3Provider>

        <TabBar />
      </body>
    </html>
  );
}
