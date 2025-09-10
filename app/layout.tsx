import type { Metadata } from 'next';
import './globals.css';
import I18nProvider from '@/components/providers/I18nProvider';

export const metadata: Metadata = {
  title: 'CryptoBali',
  description: 'Mini-app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
