// @ts-nocheck
import './globals.css';
import React from 'react';
import TabBar from '../components/ui/TabBar';
import Providers from './providers';
import { Web3Provider } from '../components/providers/Web3';

export const metadata = {
  title: 'CryptoBali — Профиль',
  description: 'Mini-app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Web3Provider>
        <Providers>
          {children}
        </Providers>
        </Web3Provider>

        <TabBar />
      </body>
    </html>
  );
}
