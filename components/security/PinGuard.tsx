'use client';
import React from 'react';

export default function PinGuard(){
  const [needPin, setNeedPin] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState('');

  React.useEffect(()=>{
    try {
      const enabled = localStorage.getItem('pin_enabled') === '1';
      const pin = localStorage.getItem('pin_code') || '';
      const ok = localStorage.getItem('pin_ok') === '1';
      if (enabled && pin && !ok) setNeedPin(true);
    } catch {}
  }, []);

  const submit = ()=>{
    try {
      const pin = localStorage.getItem('pin_code') || '';
      if (!pin) { setNeedPin(false); return; }
      if (code === pin){
        localStorage.setItem('pin_ok','1');
        setErr('');
        setNeedPin(false);
      } else {
        setErr('Неверный PIN');
      }
    } catch {}
  };

  const onInput = (v:string)=>{
    const s = v.replace(/\D/g,'').slice(0,6);
    setCode(s);
    setErr('');
  };

  if (!needPin) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(6,11,20,.6)', backdropFilter:'blur(6px)', display:'grid', placeItems:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:420, background:'#fff', color:'#0b1b2b', borderRadius:20, boxShadow:'0 10px 30px rgba(0,0,0,.25)', padding:18, display:'grid', gap:12 }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:'#e8f1ff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>🔒</div>
          <div>
            <div style={{fontWeight:900, fontSize:18}}>Введите PIN</div>
            <div style={{fontSize:12, color:'#64748b'}}>Для доступа к приложению</div>
          </div>
        </div>

        <input
          autoFocus inputMode="numeric" pattern="[0-9]*" placeholder="••••"
          value={code} onChange={e=>onInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') submit(); }}
          style={{ fontSize:22, letterSpacing:'6px', textAlign:'center', padding:'12px 14px', borderRadius:14, border:'1px solid #e5e7eb' }}
        />

        {err && <div style={{color:'#dc2626', fontSize:12}}>{err}</div>}

        <button onClick={submit} style={{width:'100%', background:'#2d6cf6', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:900}}>
          Разблокировать
        </button>
      </div>
    </div>
  );
}
