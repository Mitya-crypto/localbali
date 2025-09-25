'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
  type CreateConnectorFn,
} from 'wagmi';
import { arbitrum, base, mainnet, polygon } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();

const makeTransport = (url?: string) => (url && url.trim().length > 0 ? http(url) : http());

const connectors = (
  [
    injected(),
    ...(walletConnectProjectId
      ? [
          walletConnect({
            projectId: walletConnectProjectId,
            showQrModal: true,
            metadata: {
              name: 'CryptoBali Ocean',
              description: 'CryptoBali wallet playground',
              url: process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://cryptobali.app',
              icons: ['https://cryptobali.app/apple-touch-icon.png'],
            },
          }),
        ]
      : []),
  ] as const
) satisfies readonly CreateConnectorFn[];

const config = createConfig({
  chains: [mainnet, polygon, arbitrum, base],
  connectors,
  ssr: true,
  transports: {
    [mainnet.id]: makeTransport(process.env.NEXT_PUBLIC_MAINNET_RPC),
    [polygon.id]: makeTransport(process.env.NEXT_PUBLIC_POLYGON_RPC),
    [arbitrum.id]: makeTransport(process.env.NEXT_PUBLIC_ARBITRUM_RPC),
    [base.id]: makeTransport(process.env.NEXT_PUBLIC_BASE_RPC),
  },
});

function WalletUI() {
  const { address, isConnected } = useAccount();
  const { connectors: availableConnectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const missingWalletConnectProjectId = !walletConnectProjectId;

  return (
    <main style={{ padding: 24, display: 'grid', gap: 16, fontFamily: 'system-ui' }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Wallets</h1>
        <p style={{ marginTop: 4, color: '#4b5563' }}>
          Connect an EVM wallet using an injected provider or WalletConnect v2.
        </p>
      </header>

      {!isConnected ? (
        <section style={{ display: 'grid', gap: 12 }}>
          {availableConnectors.map((connector) => {
            const disabled = !connector.ready;
            return (
              <button
                key={connector.uid}
                type="button"
                onClick={() => connect({ connector })}
                disabled={disabled}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  background: disabled ? '#f9fafb' : '#ffffff',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 600,
                }}
                title={connector.name}
              >
                <span>{connector.name}</span>
                {!connector.ready && <span style={{ fontSize: 13, color: '#9ca3af' }}>Not ready</span>}
              </button>
            );
          })}

          <div style={{ fontSize: 13, color: '#6b7280' }}>Status: {status}</div>
          {missingWalletConnectProjectId && (
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Set <code>NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> in your environment to enable the WalletConnect button.
            </div>
          )}
          {error && (
            <div style={{ fontSize: 13, color: '#dc2626' }}>
              Error: {error.message || String(error)}
            </div>
          )}
        </section>
      ) : (
        <section style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 14, color: '#111827' }}>
            Connected address:
            <div style={{ fontFamily: 'monospace', marginTop: 4 }}>{address}</div>
          </div>
          <button
            type="button"
            onClick={() => disconnect()}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #ef4444',
              background: '#fee2e2',
              color: '#b91c1c',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </section>
      )}
    </main>
  );
}

export default function WalletsPage() {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
