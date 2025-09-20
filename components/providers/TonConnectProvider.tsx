'use client';

import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const FALLBACK_MANIFEST_PATH = '/tonconnect-manifest.json';
const TONCONNECT_ENV_MANIFEST = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL?.trim();

function resolveManifestUrl(): string | null {
  if (TONCONNECT_ENV_MANIFEST) {
    try {
      const parsed = new URL(TONCONNECT_ENV_MANIFEST);
      if (parsed.protocol !== 'https:') {
        console.error(
          '[TonConnect] NEXT_PUBLIC_TONCONNECT_MANIFEST_URL must use HTTPS. Received:',
          TONCONNECT_ENV_MANIFEST,
        );
        return null;
      }
      return parsed.toString();
    } catch (error) {
      console.error('[TonConnect] Failed to parse NEXT_PUBLIC_TONCONNECT_MANIFEST_URL.', error);
      return null;
    }
  }

  if (typeof window === 'undefined') {
    console.error('[TonConnect] Unable to resolve manifest URL outside the browser environment.');
    return null;
  }

  if (window.location.protocol === 'https:') {
    return `${window.location.origin}${FALLBACK_MANIFEST_PATH}`;
  }

  console.error(
    '[TonConnect] Manifest URL is not configured. Serve the app via HTTPS or set NEXT_PUBLIC_TONCONNECT_MANIFEST_URL to a valid HTTPS manifest.',
  );
  return null;
}

export default function TonConnectProvider({ children }: { children: React.ReactNode }) {
  const manifestUrl = React.useMemo(() => resolveManifestUrl(), []);

  if (!manifestUrl) {
    return (
      <div
        role="alert"
        style={{
          fontFamily: 'system-ui, sans-serif',
          maxWidth: 640,
          margin: '4rem auto',
          padding: '1.5rem',
          borderRadius: 12,
          border: '1px solid #f87171',
          background: '#fef2f2',
          color: '#7f1d1d',
          lineHeight: 1.5,
        }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          TonConnect manifest unavailable
        </h2>
        <p style={{ marginBottom: '0.75rem' }}>
          Provide a public HTTPS manifest for TonConnect by setting the{' '}
          <code style={{ background: '#fee2e2', padding: '0.125rem 0.375rem', borderRadius: 6 }}>
            NEXT_PUBLIC_TONCONNECT_MANIFEST_URL
          </code>{' '}
          environment variable or serve this app over HTTPS so wallets can load{' '}
          <code>/tonconnect-manifest.json</code>.
        </p>
        <p style={{ margin: 0 }}>
          Until then TonConnect features are disabled to avoid pointing wallets to an unreachable manifest.
        </p>
      </div>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
