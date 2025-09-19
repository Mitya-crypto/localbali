'use client';
import React, { useMemo, useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic';

type Curr = 'RUB'|'USD'|'IDR'|'USDT';
const RATE: Record<Curr, number> = { RUB:100, USD:1, IDR:16000, USDT:1 };

function SellCashPageInner(){
  const sp = useSearchParams();
  const router = useRouter();
  const usdt = Number(sp.get('usdt') || '0');

  const { rubOut, idrOut, usdOut } = useMemo(()=>({
    rubOut: (isFinite(usdt)&&usdt>0) ? usdt * RATE.RUB : 0,
    idrOut: (isFinite(usdt)&&usdt>0) ? usdt * RATE.IDR : 0,
    usdOut: (isFinite(usdt)&&usdt>0) ? usdt * RATE.USD : 0,
  }), [usdt]);

  const [sel, setSel] = useState<'msk'|'bali'|'courier'|null>(null);

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', display:'grid', gap:12, color:'#0b1b2b'}}>
      <h1 style={{fontSize:18, fontWeight:900, margin:'0'}}>Вывод наличными</h1>
      <div style={{fontSize:12, color:'#64748b'}}>Эквивалент: <b>{isFinite(usdt)&&usdt>0?usdt.toFixed(2):'—'} USDT</b> · <b>{rubOut?rubOut.toLocaleString('ru-RU'):'—'} RUB</b> · <b>{idrOut?idrOut.toLocaleString('ru-RU'):'—'} IDR</b></div>

      {/* ТРИ ДЛИННЫЕ ПЛИТКИ */}
      <div style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        <Tile title="Офис Москва" subtitle={`К выдаче: ${rubOut?rubOut.toLocaleString('ru-RU'):'—'} RUB`} mark="🏢" onClick={()=>setSel('msk')} />
        <Divider/>
        <Tile title="Офис Бали" subtitle={`К выдаче: ${idrOut?idrOut.toLocaleString('ru-RU'):'—'} IDR`} mark="🏝️" onClick={()=>setSel('bali')} />
        <Divider/>
        <Tile title="Курьер" subtitle="Наличные при получении (город согласуем)" mark="🚚" onClick={()=>setSel('courier')} />
      </div>

      {sel==='msk' && <Section title="Выдача в офисе — Москва">
        <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
          <li>Адрес: <b>Москва, ул. Примерная, 1, офис 101 (демо)</b></li>
          <li>К выдаче: <b>{rubOut?rubOut.toLocaleString('ru-RU'):'—'} RUB</b></li>
          <li>Возьмите паспорт/ID.</li>
        </ul>
      </Section>}

      {sel==='bali' && <Section title="Выдача в офисе — Бали">
        <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
          <li>Адрес: <b>Kuta, Jl. Demo 7 (демо)</b></li>
          <li>К выдаче: <b>{idrOut?idrOut.toLocaleString('ru-RU'):'—'} IDR</b></li>
          <li>Возьмите паспорт/ID.</li>
        </ul>
      </Section>}

      {sel==='courier' && <Section title="Курьерская доставка наличных">
        <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
          <li>Доступно в городах: Москва / Денпасар (демо).</li>
          <li>Сумма к выдаче: <b>{rubOut?rubOut.toLocaleString('ru-RU'):'—'} RUB</b> или <b>{idrOut?idrOut.toLocaleString('ru-RU'):'—'} IDR</b> — по договорённости.</li>
          <li>Курьер согласует место и время, потребуется паспорт/ID.</li>
        </ul>
      </Section>}

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
function Section({title, children}:{title:string; children:React.ReactNode}){
  return (
    <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
      <strong>{title}</strong>
      <div style={{marginTop:8}}>{children}</div>
    </section>
  );
}


export default function Page(){
  return (
    <Suspense fallback={<div />}> 
      <SellCashPageInner />
    </Suspense>
  );
}
