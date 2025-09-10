// app/providers.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const TonConnectProvider = dynamic(
  () => import('../components/providers/TonConnectProvider'),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return <TonConnectProvider>{children}</TonConnectProvider>;
}
