'use client';
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Curr = 'RUB' | 'USD' | 'IDR' | 'USDT';
const RATE: Record<Curr, number> = { RUB:100, USD:1, IDR:16000, USDT:1 };

export default function BuyMethods(){
  const sp = useSearchParams();
  const router = useRouter();

  const tab = (sp.get('tab') as Curr) || 'IDR';
  const amountIn = Number(sp.get('amount') || '0');
  const usdt = tab === 'USDT' ? amountIn : (amountIn / (RATE[tab] || 1));

  function buildMethods(t: Curr){
    if (t === 'RUB') {
      return [
        { key:'IDR',  title:'IDR',  subtitle:'Банковский перевод / карта', mark:'Rp' },
        { key:'USDT', title:'USDT', subtitle:'Оплата с криптокошелька',    mark:'T'  },
        { key:'USD',  title:'USD',  subtitle:'Банковский перевод',         mark:'$'  },
      ];
    }
    if (t === 'USD') {
      return [
        { key:'RUB',  title:'RUB',  subtitle:'Банковский перевод / карта', mark:'₽'  },
        { key:'IDR',  title:'IDR',  subtitle:'Банковский перевод / карта', mark:'Rp' },
        { key:'USDT', title:'USDT', subtitle:'Оплата с криптокошелька',    mark:'T'  },
      ];
    }
    if (t === 'IDR') {
      return [
        { key:'RUB',  title:'RUB',      subtitle:'Банковский перевод / карта', mark:'₽'  },
        { key:'USDT', title:'USDT',     subtitle:'Оплата с криптокошелька',    mark:'T'  },
        { key:'USD',  title:'USD',      subtitle:'Банковский перевод',         mark:'$'  },
        { key:'CASH', title:'Наличные', subtitle:'Оплата наличными',           mark:'Rp' },
      ];
    }
    // USDT
    return [
      { key:'RUB',  title:'RUB',      subtitle:'Банковский перевод / карта', mark:'₽'  },
      { key:'IDR',  title:'IDR',      subtitle:'Банковский перевод / карта', mark:'Rp' },
      { key:'USD',  title:'USD',      subtitle:'Банковский перевод',         mark:'$'  },
      { key:'CASH', title:'Наличные', subtitle:'Оплата наличными',           mark:'¤'  },
    ];
  }
  const methods = buildMethods(tab);

  const choose = (key:string)=>{
    if (key === 'RUB') {
      const q = new URLSearchParams({ from: tab, amount: String(amountIn || 0) });
      router.push(`/exchange/buy/rub?${q.toString()}` as any);
      return;
    }
    if (key === 'USDT') {
      const q = new URLSearchParams({ usdt: String(usdt || 0) });
      router.push(`/exchange/buy/usdt?${q.toString()}` as any);
      return;
    }
    if (key === 'USD') {
      const q = new URLSearchParams({ from: tab, amount: String(amountIn || 0) });
      router.push(`/exchange/buy/usd?${q.toString()}` as any);
      return;
    }
    if (key === 'CASH') {
      // Единая страница наличных
      const q = new URLSearchParams({ from: tab, amount: String(amountIn || 0) });
      router.push(`/exchange/buy/cash?${q.toString()}` as any);
      return;
    }
    alert(`Демо: выбран способ оплаты — ${key}`);
  };

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', color:'#0b1b2b'}}>
      <h1 style={{fontSize:18, fontWeight:900, margin:'0 0 12px'}}>Способы оплаты</h1>

      <div style={{background:'#fff', borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)', padding:12, marginBottom:14}}>
        <div style={{fontWeight:800}}>Вы выбрали: {isFinite(amountIn)&&amountIn>0 ? amountIn.toLocaleString('ru-RU') : '—'} {tab}</div>
        <div style={{fontSize:12, color:'#64748b', marginTop:4}}>≈ {isFinite(usdt)&&usdt>0 ? usdt.toFixed(2) : '—'} USDT</div>
      </div>

      <div style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)', marginBottom:12}}>
        {methods.map((m, idx)=>(
          <React.Fragment key={m.key}>
            <button
              type="button"
              onClick={()=>choose(m.key)}
              style={{width:'100%', display:'flex', alignItems:'center', gap:12, textAlign:'left', background:'transparent', border:'none', padding:'14px 16px', cursor:'pointer'}}
            >
              <span style={{width:36, height:36, borderRadius:12, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#2d6cf6'}}>{m.mark}</span>
              <span style={{display:'flex', flexDirection:'column'}}>
                <span style={{fontWeight:900}}>{m.title}</span>
                <span style={{fontSize:12, color:'#64748b', marginTop:2}}>{m.subtitle}</span>
              </span>
              <span style={{marginLeft:'auto', opacity:.8}}>›</span>
            </button>
            {idx < methods.length - 1 && <div style={{height:1, background:'#f1f5f9'}}/>}
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        onClick={()=>router.back()}
        style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:900}}
      >
        Назад
      </button>
    </div>
  );
}
