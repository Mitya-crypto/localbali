'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

async function sha256Hex(s: string) {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function PinContent(){
  const router = useRouter();
  const params = useSearchParams();
  const mode = (params.get('mode') === 'set') ? 'set' : 'check';
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (pin.length !== 4) return;
    (async () => {
      const hash = await sha256Hex(pin);
      const stored = localStorage.getItem('pinHash');
      if (mode === 'set') {
    localStorage.setItem('pinHash', hash);
        sessionStorage.setItem('unlocked', '1');
        router.replace('/home');
      } else {
        if (stored && stored === hash) {
          sessionStorage.setItem('unlocked', '1');
          router.replace('/home');
        } else {
          alert('Неверный PIN');
          setPin('');
        }
      }
    })();
  }, [pin, mode, router]);

  const press = (k: string) => {
    if (k === '←') setPin(s => s.slice(0, -1));
    else if (pin.length < 4 && /^\d$/.test(k)) setPin(s => s + k);
  };

  const keys = useMemo(()=>['1','2','3','4','5','6','7','8','9','0','←'],[]);

  return (
     <div style={{minHeight:'100svh', background:'var(--bg)', color:'var(--text)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, fontFamily:'system-ui'}}>
      <h1 style={{fontSize:24, fontWeight:700}}>
        {mode === 'set' ? 'Создайте PIN-код' : 'Введите PIN-код'}
      </h1>
      <div style={{display:'flex', gap:12}}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:14, height:14, borderRadius:999, background: i < pin.length ? 'var(--primary)' : 'var(--border)'
          }}/>
        ))}
      </div>
      <div style={{width:280, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
        {keys.map(k => (
          <button key={k} onClick={() => press(k)}
            style={{height:56, borderRadius:28, border:'1px solid var(--border)', background:'var(--card)', color:'var(--text)', fontSize:18}}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PinPage(){
  return (
    <Suspense fallback={<div style={{minHeight:'100svh'}}/>}>
      <PinContent />
    </Suspense>
  );
}
