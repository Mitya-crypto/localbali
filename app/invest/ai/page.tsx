'use client';
import dynamic from 'next/dynamic';

// Попробуем подцепить твой реальный компонент, иначе покажем аккуратную заглушку
const Fallback = () => (
  <div className="card">Модуль ИИ-советов не найден. Положите его в <code>components/invest/Advisor.tsx</code>.</div>
);

const Advisor = dynamic(async () => {
  try {
    const mod = await import('../../../components/invest/Advisor');
    return (mod as any).default || (mod as any);
  } catch {
    return Fallback as any;
  }
}, { ssr: false });

export default function InvestAIPage(){
  return (
    <div className="vstack" style={{gap:16}}>
      <div className="topbar"><Link href="/invest">← Инвестиции</a></div>
      <Advisor />
    </div>
  );
}
