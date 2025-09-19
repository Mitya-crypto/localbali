'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const ADDR_ERC20 = '0xDEMO9dF13aA7cE0bF7e1E9A1bCDeF12345678901';
const ADDR_TRC20 = 'TRDEMO9fF5cZbR9FQh4o7iH1uB2wK3m4n5p6q7r8';

export default function SellUsdtPage(){
  const sp = useSearchParams();
  const router = useRouter();
  const usdt = Number(sp.get('usdt') || '0');
  const [net, setNet] = useState<'ERC20'|'TRC20'>('TRC20');

  const addr = net==='TRC20' ? ADDR_TRC20 : ADDR_ERC20;

  const copy = async ()=>{
    try { await navigator.clipboard.writeText(addr); alert('Адрес скопирован'); }
    catch { alert('Не удалось скопировать'); }
  };

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', display:'grid', gap:14, color:'#0b1b2b'}}>
      <h1 style={{fontSize:18, fontWeight:900, margin:'0'}}>Перевод USDT</h1>
      <div style={{fontSize:12, color:'#64748b'}}>Отправьте: <b>{isFinite(usdt)&&usdt>0 ? usdt.toFixed(2) : '—'} USDT</b></div>

      <div style={{display:'flex', gap:8}}>
        <button onClick={()=>setNet('TRC20')} style={{flex:1, padding:'10px 12px', borderRadius:12, border:'1px solid #e5e7eb', background: net==='TRC20' ? '#e8f1ff' : '#fff', fontWeight:900}}>TRC20</button>
        <button onClick={()=>setNet('ERC20')} style={{flex:1, padding:'10px 12px', borderRadius:12, border:'1px solid #e5e7eb', background: net==='ERC20' ? '#e8f1ff' : '#fff', fontWeight:900}}>ERC20</button>
      </div>

      <div style={{display:'grid', justifyContent:'center'}}>
        <div style={{
          width:200, height:200, borderRadius:12,
          background:'conic-gradient(#111 0 25%, #fff 0 50%, #111 0 75%, #fff 0)',
          boxShadow:'0 1px 3px rgba(0,0,0,.12)'
        }} aria-label="QR placeholder" />
        <div style={{textAlign:'center', fontSize:12, color:'#64748b', marginTop:6}}>Отсканируйте этот QR-код</div>
      </div>

      <div style={{display:'grid', gap:8}}>
        <div style={{fontWeight:900}}>Адрес для перевода ({net}):</div>
        <div style={{display:'flex', gap:8}}>
          <input readOnly value={addr} style={{flex:1, border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 12px', fontFamily:'monospace'}} />
          <button onClick={copy} style={{padding:'10px 12px', borderRadius:12, border:'1px solid #e5e7eb', fontWeight:900}}>Копировать</button>
        </div>
      </div>

      <ul style={{margin:'4px 0 0 18px', lineHeight:1.45, fontSize:12, color:'#475569'}}>
        <li>Сеть должна совпадать с адресом (TRC20 или ERC20).</li>
        <li>Отправьте ровно указанную сумму, чтобы ускорить подтверждение.</li>
        <li>После 1–2 подтверждений мы обработаем ваш вывод (демо).</li>
      </ul>

      <button
        type="button"
        onClick={()=>router.back()}
        style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:900, marginTop:6}}
      >Назад</button>
    </div>
  );
}
