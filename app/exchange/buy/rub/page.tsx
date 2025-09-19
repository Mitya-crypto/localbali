'use client';
import React, { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Curr = 'RUB' | 'USD' | 'IDR' | 'USDT';
type BankKey = 'sber'|'tinkoff'|'alfa'|'ozon'|'sbp';

// ДЕМО-курсы
const RATE: Record<Curr, number> = { RUB:100, USD:1, IDR:16000, USDT:1 };

export default function BuyRubPage(){
  const sp = useSearchParams();
  const router = useRouter();
  const from = (sp.get('from') as Curr) || 'RUB';     // из какой вкладки «Купить»
  const amountIn = Number(sp.get('amount') || '0');   // сумма во вкладке «Купить»

  // Пересчёт в RUB с учётом источника
  const amountRub = useMemo(()=>{
    if (!isFinite(amountIn) || amountIn <= 0) return 0;
    if (from === 'RUB')  return amountIn;
    if (from === 'USD')  return amountIn * (RATE.RUB / RATE.USD);    // USD -> USDT -> RUB
    if (from === 'IDR')  return (amountIn / RATE.IDR) * RATE.RUB;    // IDR -> USDT -> RUB
    if (from === 'USDT') return amountIn * RATE.RUB;                 // USDT -> RUB
    return 0;
  }, [from, amountIn]);

  const [sel, setSel] = useState<BankKey | null>(null);

  const banks: {key:BankKey; title:string; sub:string; icon:React.ReactNode}[] = [
    { key:'sber',    title:'СберБанк',      sub:'Перевод по реквизитам/карте', icon:LogoSber() },
    { key:'tinkoff', title:'Тинькофф',      sub:'Перевод по реквизитам/карте', icon:LogoTinkoff() },
    { key:'alfa',    title:'Альфа-Банк',    sub:'Перевод по реквизитам/карте', icon:LogoAlfa() },
    { key:'ozon',    title:'Ozon',          sub:'Перевод по реквизитам/карте', icon:LogoOzon() },
    { key:'sbp',     title:'СБП',           sub:'Оплата через СБП',            icon:LogoSBP() },
  ];

  const onConfirm = ()=>{
    alert('Демо: оплата зафиксирована. Возвращаемся к обмену.');
    router.push('/exchange' as any);
  };

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', color:'#0b1b2b', display:'grid', gap:12}}>
      <button type="button" onClick={()=>router.back()} className="btn btn-ghost" style={{alignSelf:'start', width:'auto'}}>‹ Назад</button>

      <h1 style={{fontSize:18, fontWeight:900, margin:'0 0 6px'}}>Оплата в RUB</h1>
      <div style={{fontSize:12, color:'#64748b', marginBottom:6}}>
        Источник: <b>{from}</b> · К оплате: <b>{amountRub ? amountRub.toLocaleString('ru-RU') : '—'} RUB</b>
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
        <strong style={{fontSize:16}}>Инструкция — {title}</strong>
        <span style={{marginLeft:'auto', fontSize:12, color:'#64748b'}}>Демо</span>
      </div>

      {bank!=='sbp' ? (
        <ol style={{margin:'0 0 6px 18px', padding:0, lineHeight:1.45}}>
          <li>Откройте приложение банка <b>{title}</b>.</li>
          <li>Выберите «Перевод по карте/реквизитам».</li>
          <li>Получатель: <b>OOO «Bali Demo»</b></li>
          <li>Номер карты: <code>2202 •••• ••12 3456</code> (демо)</li>
          <li>Назначение: <code>Пополнение кошелька</code></li>
          <li>Сумма: <b>{amountRub ? amountRub.toLocaleString('ru-RU') : '—'} RUB</b></li>
          <li>Подтвердите платёж и вернитесь сюда.</li>
        </ol>
      ) : (
        <div style={{display:'grid', gap:10}}>
          <div style={{fontSize:14}}>Оплата через <b>СБП</b>:</div>
          <ol style={{margin:'0 0 6px 18px', padding:0, lineHeight:1.45}}>
            <li>В вашем банковском приложении выберите «Оплата по СБП» / «Сканировать QR».</li>
            <li>Сканируйте QR-код ниже.</li>
            <li>Проверьте сумму: <b>{amountRub ? amountRub.toLocaleString('ru-RU') : '—'} RUB</b>.</li>
            <li>Подтвердите платёж, затем вернитесь сюда.</li>
          </ol>
          <div style={{display:'grid', justifyContent:'center', padding:'8px 0'}}>
            <div style={{width:180, height:180, borderRadius:12, background:'conic-gradient(#111 0 25%, #fff 0 50%, #111 0 75%, #fff 0)', boxShadow:'0 1px 3px rgba(0,0,0,.12)'}} aria-label="QR placeholder"/>
            <div style={{textAlign:'center', fontSize:12, color:'#64748b', marginTop:6}}>Демо-QR (пример)</div>
          </div>
        </div>
      )}

      <button type="button" onClick={onConfirm} style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:900}}>
        Я оплатил(а)
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
