'use client';
import React, { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Curr = 'RUB' | 'USD' | 'IDR' | 'USDT';
type BankKey = 'sber'|'tinkoff'|'alfa'|'ozon'|'sbp';
const RATE: Record<Curr, number> = { RUB:100, USD:1, IDR:16000, USDT:1 };

export default function SellRubPage(){
  const sp = useSearchParams();
  const router = useRouter();

  // из «Продать»: мы всегда вводим сумму в USDT
  const usdt = Number(sp.get('usdt') || '0');
  const amountRub = useMemo(()=> (isFinite(usdt) && usdt>0) ? (usdt * RATE.RUB) : 0, [usdt]);

  const [sel, setSel] = useState<BankKey | null>(null);

  const banks: {key:BankKey; title:string; sub:string; icon:React.ReactNode}[] = [
    { key:'sber',    title:'СберБанк',      sub:'Перевод на вашу карту/счёт', icon:LogoSber() },
    { key:'tinkoff', title:'Тинькофф',      sub:'Перевод на вашу карту/счёт', icon:LogoTinkoff() },
    { key:'alfa',    title:'Альфа-Банк',    sub:'Перевод на вашу карту/счёт', icon:LogoAlfa() },
    { key:'ozon',    title:'Ozon',          sub:'Перевод на вашу карту/счёт', icon:LogoOzon() },
    { key:'sbp',     title:'СБП',           sub:'Перевод через СБП',          icon:LogoSBP() },
  ];

  const onConfirm = ()=>{
    alert('Демо: реквизиты сохранены, перевод будет отправлен. Возвращаемся к обмену.');
    router.push('/exchange' as any);
  };

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', color:'#0b1b2b', display:'grid', gap:12}}>
      <button type="button" onClick={()=>router.back()} className="btn btn-ghost" style={{alignSelf:'start', width:'auto'}}>‹ Назад</button>

      <h1 style={{fontSize:18, fontWeight:900, margin:'0 0 6px'}}>Вывод в RUB</h1>
      <div style={{fontSize:12, color:'#64748b', marginBottom:6}}>
        Вы продаёте: <b>{isFinite(usdt)&&usdt>0 ? usdt.toFixed(2) : '—'} USDT</b> · К зачислению: <b>{amountRub ? amountRub.toLocaleString('ru-RU') : '—'} RUB</b>
      </div>

      <div style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        {banks.map((b, i)=>(
          <React.Fragment key={b.key}>
            <button
              type="button"
              onClick={()=>setSel(b.key)}
              style={{width:'100%', display:'flex', gap:12, alignItems:'center', background:'transparent', border:'none', textAlign:'left', padding:'14px 16px', cursor:'pointer'}}
            >
              <span style={{width:40, height:40, borderRadius:12, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>{b.icon}</span>
              <span style={{display:'flex', flexDirection:'column'}}>
                <span style={{fontWeight:900}}>{b.title}</span>
                <span style={{fontSize:12, color:'#64748b'}}>{b.sub}</span>
              </span>
              <span style={{marginLeft:'auto', opacity:.7}}>›</span>
            </button>
            {i < banks.length - 1 && <div style={{height:1, background:'#f1f5f9'}}/>}
          </React.Fragment>
        ))}
      </div>

      {sel && <Instruction bank={sel} amountRub={amountRub} onConfirm={onConfirm} />}
    </div>
  );
}

function Instruction({bank, amountRub, onConfirm}:{bank:BankKey; amountRub:number; onConfirm:()=>void}){
  const title = bank==='sber'?'СберБанк'
             : bank==='tinkoff'?'Тинькофф'
             : bank==='alfa'?'Альфа-Банк'
             : bank==='ozon'?'Ozon'
             : 'СБП';
  return (
    <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)', display:'grid', gap:10}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <strong style={{fontSize:16}}>Реквизиты — {title}</strong>
        <span style={{marginLeft:'auto', fontSize:12, color:'#64748b'}}>Демо</span>
      </div>

      {bank!=='sbp' ? (
        <ol style={{margin:'0 0 6px 18px', padding:0, lineHeight:1.45}}>
          <li>Укажите номер вашей карты/счёта в <b>{title}</b>.</li>
          <li>ФИО получателя: <b>как в банке</b>.</li>
          <li>Комментарии к переводу: <code>Вывод средств</code> (если требуется).</li>
          <li>Сумма к зачислению: <b>{amountRub ? amountRub.toLocaleString('ru-RU') : '—'} RUB</b>.</li>
          <li>Подтвердите отправку реквизитов.</li>
        </ol>
      ) : (
        <div style={{display:'grid', gap:10}}>
          <div style={{fontSize:14}}>Перевод через <b>СБП</b> на вашу карту:</div>
          <ol style={{margin:'0 0 6px 18px', padding:0, lineHeight:1.45}}>
            <li>Отправьте номер телефона, привязанный к СБП.</li>
            <li>Мы инициируем перевод <b>{amountRub ? amountRub.toLocaleString('ru-RU') : '—'} RUB</b>.</li>
            <li>Подтвердите получение в своём банке.</li>
          </ol>
        </div>
      )}

      <button type="button" onClick={onConfirm} style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:900}}>
        Отправить реквизиты
      </button>
    </section>
  );
}

/* Лого (SVG) */
function LogoSber(){return(<svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#21A038"/><path d="M6.5 12.5l3.2 3.2 7.8-7.8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function LogoTinkoff(){return(<svg width="26" height="26" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="6" fill="#FFDD2D"/><path d="M8 9h8v6H8z" fill="#111"/><path d="M10 7h4v2h-4zM10 15h4v2h-4z" fill="#111"/></svg>);}
function LogoAlfa(){return(<svg width="26" height="26" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#E31E24"/><path d="M8 16h8M9 16l3.5-9L16 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function LogoOzon(){return(<svg width="26" height="26" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#005BFF"/><circle cx="12" cy="12" r="4.5" fill="#fff"/><path d="M6 12h4M14 12h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>);}
function LogoSBP(){return(<svg width="26" height="26" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#F1F5F9"/><path d="M6 12l4-4v8l4-4" fill="#7C3AED"/><path d="M10 8l8 4-8 4" fill="#22C55E" opacity=".9"/></svg>);}
