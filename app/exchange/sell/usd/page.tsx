'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SellUsdPage(){
  const sp = useSearchParams();
  const router = useRouter();
  const usd = Number(sp.get('usdt') || '0'); // 1 USDT = 1 USD (демо)

  const [sel, setSel] = useState<'zelle'|'msk'|'bali'|null>(null);
  const [zelleEmail, setZelleEmail] = useState('');

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', color:'#0b1b2b', display:'grid', gap:12}}>
      <h1 style={{fontSize:18, fontWeight:900, margin:'0'}}>Вывод в USD</h1>
      <div style={{fontSize:12, color:'#64748b'}}>К зачислению: <b>{isFinite(usd)&&usd>0 ? usd.toFixed(2) : '—'} USD</b></div>

      {/* ТРИ ДЛИННЫЕ ПЛИТКИ */}
      <div style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
        <Tile title="Банковский перевод Zelle" subtitle="На ваш Zelle e-mail" mark="$" onClick={()=>setSel('zelle')} />
        <Divider/>
        <Tile title="Офис Москва" subtitle="Получение в офисе" mark="🏢" onClick={()=>setSel('msk')} />
        <Divider/>
        <Tile title="Офис Бали" subtitle="Получение в офисе" mark="🏝️" onClick={()=>setSel('bali')} />
      </div>

      {sel==='zelle' && (
        <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)', display:'grid', gap:10}}>
          <strong>Перевод через Zelle</strong>
          <div style={{fontSize:12, color:'#64748b'}}>Укажите e-mail, привязанный к Zelle. Мы отправим <b>{isFinite(usd)&&usd>0 ? usd.toFixed(2) : '—'} USD</b>.</div>
          <div style={{display:'flex', gap:8}}>
            <input
              placeholder="you@example.com"
              value={zelleEmail}
              onChange={e=>setZelleEmail(e.target.value)}
              style={{flex:1, border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 12px'}}
            />
            <button
              onClick={()=>alert('Демо: реквизиты приняты, перевод будет отправлен.')}
              style={{padding:'10px 12px', borderRadius:12, border:'1px solid #e5e7eb', fontWeight:900}}
            >Готово</button>
          </div>
        </section>
      )}

      {sel==='msk' && (
        <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
          <strong>Получение в офисе — Москва</strong>
          <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
            <li>Адрес: <b>Москва, ул. Примерная, 1, офис 101 (демо)</b></li>
            <li>Сумма к выдаче: <b>{isFinite(usd)&&usd>0 ? usd.toFixed(2) : '—'} USD</b></li>
            <li>Возьмите паспорт/ID.</li>
          </ul>
        </section>
      )}

      {sel==='bali' && (
        <section style={{background:'#fff', borderRadius:16, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,.08)'}}>
          <strong>Получение в офисе — Бали</strong>
          <ul style={{margin:'6px 0 0 18px', lineHeight:1.45}}>
            <li>Адрес: <b>Kuta, Jl. Demo 7 (демо)</b></li>
            <li>Сумма к выдаче: <b>{isFinite(usd)&&usd>0 ? usd.toFixed(2) : '—'} USD</b></li>
            <li>Возьмите паспорт/ID.</li>
          </ul>
        </section>
      )}

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
