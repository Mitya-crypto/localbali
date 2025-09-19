'use client';
import React, { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Curr = 'RUB'|'USD'|'IDR'|'USDT';
const RATE: Record<Curr, number> = { RUB:100, USD:1, IDR:16000, USDT:1 };

export default function BuyUsdPage(){
  const sp = useSearchParams();
  const router = useRouter();
  const from = (sp.get('from') as Curr) || 'USD';
  const amount = Number(sp.get('amount') || '0');

  // Сколько платить в USD с учётом источника
  const usdDue = useMemo(()=>{
    if (!isFinite(amount) || amount<=0) return 0;
    if (from === 'USD')  return amount;
    if (from === 'USDT') return amount * (RATE.USD / RATE.USDT); // 1:1
    if (from === 'RUB')  return amount / RATE.RUB;
    if (from === 'IDR')  return amount / RATE.IDR;
    return 0;
  }, [from, amount]);

  const [sel, setSel] = useState<'zelle'|'msk'|'bali'|null>(null);

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', color:'#0b1b2b', display:'grid', gap:12}}>
      <h1 style={{fontSize:18, fontWeight:900, margin:'0'}}>Оплата в USD</h1>
      <div style={{fontSize:12, color:'#64748b'}}>К оплате: <b>{usdDue ? usdDue.toFixed(2) : '—'} USD</b></div>

      {/* ТРИ ДЛИННЫЕ ПЛИТКИ */}
      <div style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        <Tile title="Банковский перевод Zelle" subtitle="Оплатите через Zelle" mark="$" onClick={()=>setSel('zelle')} />
        <Divider/>
        <Tile title="Офис Москва" subtitle="Оплата в офисе" mark="🏢" onClick={()=>setSel('msk')} />
        <Divider/>
        <Tile title="Офис Бали" subtitle="Оплата в офисе" mark="🏝️" onClick={()=>setSel('bali')} />
      </div>

      {sel && <InstructionBuy kind={sel} usd={usdDue} />}

      <button type="button" onClick={()=>router.back()} style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:900}}>Назад</button>
    </div>
  );
}

function Divider(){ return <div style={{height:1, background:'#f1f5f9'}}/>; }
function Tile({title, subtitle, mark, onClick}:{title:string; subtitle:string; mark:string; onClick:()=>void}){
  return (
    <button type="button" onClick={onClick} style={{width:'100%', display:'flex', gap:12, alignItems:'center', background:'transparent', border:'none', textAlign:'left', padding:'14px 16px', cursor:'pointer'}}>
      <span style={{width:40, height:40, borderRadius:12, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#2d6cf6'}}>{mark}</span>
      <span style={{display:'flex', flexDirection:'column'}}>
        <span style={{fontWeight:900}}>{title}</span>
        <span style={{fontSize:12, color:'#64748b'}}>{subtitle}</span>
      </span>
      <span style={{marginLeft:'auto', opacity:.7}}>›</span>
    </button>
  );
}

function InstructionBuy({kind, usd}:{kind:'zelle'|'msk'|'bali'; usd:number}){
  if (kind==='zelle') return (
    <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)', display:'grid', gap:10}}>
      <strong>Оплата через Zelle</strong>
      <ol style={{margin:'0 0 6px 18px', padding:0, lineHeight:1.45}}>
        <li>Откройте ваше банковское приложение.</li>
        <li>Выберите <b>Zelle</b> → отправка по e-mail.</li>
        <li>Получатель: <code>pay@bali.demo</code></li>
        <li>Имя: <code>Bali Demo LLC</code></li>
        <li>Сумма: <b>{usd ? usd.toFixed(2) : '—'} USD</b></li>
        <li>Memo: <code>Wallet top-up</code></li>
      </ol>
      <div style={{display:'grid', justifyContent:'center', padding:'8px 0'}}>
        <div style={{width:180, height:180, borderRadius:12, background:'conic-gradient(#111 0 25%, #fff 0 50%, #111 0 75%, #fff 0)'}} aria-label="QR placeholder"/>
        <div style={{textAlign:'center', fontSize:12, color:'#64748b', marginTop:6}}>Отсканируйте QR или используйте e-mail</div>
      </div>
    </section>
  );
  if (kind==='msk') return (
    <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)', display:'grid', gap:10}}>
      <strong>Оплата в офисе — Москва</strong>
      <div style={{fontSize:14}}>Адрес: <b>Москва, ул. Примерная, 1, офис 101 (демо)</b></div>
      <ul style={{margin:'0 0 0 18px', lineHeight:1.45}}>
        <li>Назначьте визит, покажите этот экран.</li>
        <li>Сумма к оплате: <b>{usd ? usd.toFixed(2) : '—'} USD</b>.</li>
      </ul>
    </section>
  );
  return (
    <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)', display:'grid', gap:10}}>
      <strong>Оплата в офисе — Бали</strong>
      <div style={{fontSize:14}}>Адрес: <b>Kuta, Jl. Demo 7 (демо)</b></div>
      <ul style={{margin:'0 0 0 18px', lineHeight:1.45}}>
        <li>Назначьте визит, покажите этот экран.</li>
        <li>Сумма к оплате: <b>{usd ? usd.toFixed(2) : '—'} USD</b>.</li>
      </ul>
    </section>
  );
}
