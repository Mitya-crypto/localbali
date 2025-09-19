'use client';
import React, { useMemo, useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic';

type Curr = 'RUB'|'USD'|'IDR'|'USDT';
const RATE: Record<Curr, number> = { RUB:100, USD:1, IDR:16000, USDT:1 };

function BuyCashPageInner(){
  const sp = useSearchParams();
  const router = useRouter();
  const from = (sp.get('from') as Curr) || 'IDR';
  const amount = Number(sp.get('amount') || '0');

  // Пересчёт во все основные валюты через USDT
  const { usdt, rubDue, idrDue, usdDue } = useMemo(()=>{
    const _usdt = (!isFinite(amount) || amount<=0) ? 0 : (from==='USDT' ? amount : amount / RATE[from]);
    return {
      usdt: _usdt,
      rubDue: _usdt * RATE.RUB,
      idrDue: _usdt * RATE.IDR,
      usdDue: _usdt * RATE.USD,
    };
  }, [from, amount]);

  const [sel, setSel] = useState<'msk'|'bali'|'courier'|null>(null);

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', display:'grid', gap:12, color:'#0b1b2b'}}>
      <h1 style={{fontSize:18, fontWeight:900, margin:'0'}}>Оплата наличными</h1>
      <div style={{fontSize:12, color:'#64748b'}}>Эквивалент: <b>{usdt ? usdt.toFixed(2) : '—'} USDT</b> · <b>{rubDue?rubDue.toLocaleString('ru-RU'):'—'} RUB</b> · <b>{idrDue?idrDue.toLocaleString('ru-RU'):'—'} IDR</b></div>

      {/* ТРИ ДЛИННЫЕ ПЛИТКИ */}
      <div style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        <Tile title="Офис Москва" subtitle={`К оплате: ${rubDue?rubDue.toLocaleString('ru-RU'):'—'} RUB`} mark="🏢" onClick={()=>setSel('msk')} />
        <Divider/>
        <Tile title="Офис Бали" subtitle={`К оплате: ${idrDue?idrDue.toLocaleString('ru-RU'):'—'} IDR`} mark="🏝️" onClick={()=>setSel('bali')} />
        <Divider/>
        <Tile title="Курьер" subtitle="Оплата при получении (город согласуем)" mark="🚚" onClick={()=>setSel('courier')} />
      </div>

      {sel==='msk' && <Section title="Оплата в офисе — Москва">
        <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
          <li>Адрес: <b>Москва, ул. Примерная, 1, офис 101 (демо)</b></li>
          <li>К оплате: <b>{rubDue?rubDue.toLocaleString('ru-RU'):'—'} RUB</b></li>
          <li>Возьмите паспорт/ID для подтверждения.</li>
        </ul>
      </Section>}

      {sel==='bali' && <Section title="Оплата в офисе — Бали">
        <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
          <li>Адрес: <b>Kuta, Jl. Demo 7 (демо)</b></li>
          <li>К оплате: <b>{idrDue?idrDue.toLocaleString('ru-RU'):'—'} IDR</b></li>
          <li>Возьмите паспорт/ID для подтверждения.</li>
        </ul>
      </Section>}

      {sel==='courier' && <Section title="Оплата курьеру">
        <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
          <li>Доступно в городах: Москва / Денпасар (демо).</li>
          <li>Сумма к оплате: <b>{rubDue?rubDue.toLocaleString('ru-RU'):'—'} RUB</b> или <b>{idrDue?idrDue.toLocaleString('ru-RU'):'—'} IDR</b> — по договорённости.</li>
          <li>Курьер позвонит за 15–30 минут до приезда.</li>
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
      <BuyCashPageInner />
    </Suspense>
  );
}
