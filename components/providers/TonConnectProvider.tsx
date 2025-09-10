'use client';
import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TonConnectProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
