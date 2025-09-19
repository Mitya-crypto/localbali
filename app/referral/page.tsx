'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

function makeCode(seed:string){
  // простой генератор кода, привяжем к e-mail (если есть) или к локальному random
  const base = seed || (Math.random().toString(36).slice(2) + Date.now().toString(36));
  return 'BALI-' + base.replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase();
}

export default function ReferralPage(){
  const router = useRouter();
  const [code, setCode] = React.useState<string>('');

  React.useEffect(()=>{
    try{
      const saved = localStorage.getItem('referralCode');
      if (saved) { setCode(saved); return; }
      const email = localStorage.getItem('userEmail') || '';
      const c = makeCode(email);
      localStorage.setItem('referralCode', c);
      setCode(c);
    }catch{}
  },[]);

  const copy = async ()=>{
    try{
      await navigator.clipboard.writeText(code);
      alert('Скопировано: ' + code);
    }catch{
      alert('Скопируйте вручную: ' + code);
    }
  };

  const share = async ()=>{
    const url = typeof window!=='undefined' ? window.location.origin + '/referral?c=' + encodeURIComponent(code) : '';
    const text = `Мой реферальный код ${code}. До 30% комиссии.`;
    try{
      if (navigator.share) await navigator.share({ title:'Bali — Реферальная программа', text, url });
      else await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Ссылка готова. Можно отправлять.');
    }catch{}
  };

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px', color:'#0b1b2b', display:'grid', gap:12}}>
      <header style={{display:'grid', gap:4}}>
        <h1 style={{fontSize:20, fontWeight:900, margin:0}}>Реферальная программа</h1>
        <div style={{fontSize:12, color:'#64748b'}}>До 30% комиссии — делитесь ссылкой и кодом</div>
      </header>

      <section style={{background:'#fff', borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,.08)', padding:14, display:'grid', gap:10}}>
        <div style={{fontSize:12, color:'#64748b'}}>Ваш код</div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{flex:1, fontWeight:900, fontSize:18, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 12px'}}>{code || '—'}</div>
          <button onClick={copy} style={{border:'1px solid #e5e7eb', background:'#fff', borderRadius:12, padding:'10px 12px', fontWeight:900}}>Копировать</button>
        </div>
        <button onClick={share} style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:12, padding:'12px 16px', fontWeight:900}}>Поделиться</button>
      </section>

      <section style={{background:'#fff', borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,.08)', padding:14}}>
        <strong>Как это работает</strong>
        <ol style={{margin:'8px 0 0 18px', lineHeight:1.45}}>
          <li>Скопируйте код или ссылку и отправьте другу.</li>
          <li>Когда друг совершит обмен, вы получите вознаграждение.</li>
          <li>Размер вознаграждения до 30% комиссии (демо).</li>
        </ol>
      </section>

      <button onClick={()=>router.back()} style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:12, padding:'12px 16px', fontWeight:900}}>Назад</button>
    </div>
  );
}
