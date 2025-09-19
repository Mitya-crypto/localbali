'use client';
import dynamic from 'next/dynamic';

const Fallback = () => (
  <div className="card">Компонент портфеля не найден. Положите его в <code>components/invest/Portfolio.tsx</code>.</div>
);

const Portfolio = dynamic(async () => {
  try {
    const mod = await import('../../../components/invest/Portfolio');
    return (mod as any).default || (mod as any);
  } catch {
    return Fallback as any;
  }
}, { ssr: false });

export default function PortfolioPage(){
  return (
    <div className="vstack" style={{gap:16}}>
      <div className="topbar"><Link href="/invest">← Инвестиции</a></div>
      <Portfolio />
    </div>
  );
}
