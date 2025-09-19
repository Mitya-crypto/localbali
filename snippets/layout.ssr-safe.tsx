import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import PinGuard from '../components/security/PinGuard';

export const metadata: Metadata = { title: 'Bali', description: 'Mini App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="light" style={{ colorScheme:'light' }} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <PinGuard />
          </Providers>
      </body>
    </html>
  );
}
