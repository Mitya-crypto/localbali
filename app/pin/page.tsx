'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_PIN_LENGTH = 4;

type NavigatorWithCredentials = Navigator & {
  credentials?: {
    get?: (options?: CredentialRequestOptions) => Promise<Credential | null>;
  };
};

type Mode = 'set' | 'unlock';

export default function PinPage(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin,setPin] = useState('');
  const [error,setError] = useState('');
  const [hydrated,setHydrated] = useState(false);
  const [pinStored,setPinStored] = useState('');
  const [pinEnabled,setPinEnabled] = useState(false);
  const [pinOk,setPinOk] = useState(false);
  const [biometryPayload,setBiometryPayload] = useState<string|null>(null);
  const [canUseBiometry,setCanUseBiometry] = useState(false);

  const mode:Mode = searchParams?.get('mode') === 'set' ? 'set' : 'unlock';

  const redirectTarget = useMemo(()=>{
    const ref = searchParams?.get('ref');
    if (ref && ref.startsWith('/')) return ref;
    return '/home';
  },[searchParams]);

  const pinLength = mode === 'set'
    ? DEFAULT_PIN_LENGTH
    : (pinStored.length || DEFAULT_PIN_LENGTH);

  useEffect(()=>{
    try {
      const stored = localStorage.getItem('pin_code') || '';
      const enabled = localStorage.getItem('pin_enabled') === '1';
      setPinStored(stored);
      setPinEnabled(enabled && stored.length > 0);
      const payload = localStorage.getItem('pin_biometry_request') ?? localStorage.getItem('pin_biometry');
      setBiometryPayload(payload);
      if (payload) {
        const nav = typeof window !== 'undefined' ? (navigator as NavigatorWithCredentials) : undefined;
        setCanUseBiometry(Boolean(nav?.credentials?.get) || payload.trim() === 'ok');
      } else {
        setCanUseBiometry(false);
      }
    } catch {}
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if (!hydrated || mode !== 'unlock' || pinOk) return;
    if (!pinEnabled) {
      try { localStorage.setItem('pin_ok','1'); } catch {}
      setPinOk(true);
      router.replace(redirectTarget);
    }
  },[hydrated, mode, pinEnabled, pinOk, router, redirectTarget]);

  useEffect(()=>{
    if (!hydrated || pinOk) return;
    if (pin.length < pinLength) return;

    if (mode === 'set') {
      try {
        localStorage.setItem('pin_code', pin);
        localStorage.setItem('pin_enabled','1');
        localStorage.setItem('pin_ok','1');
      } catch {}
      setPinOk(true);
      router.replace(redirectTarget);
      return;
    }

    if (!pinEnabled) {
      try { localStorage.setItem('pin_ok','1'); } catch {}
      setPinOk(true);
      router.replace(redirectTarget);
      return;
    }

    if (pinStored && pin === pinStored) {
      try { localStorage.setItem('pin_ok','1'); } catch {}
      setPinOk(true);
      setError('');
      router.replace(redirectTarget);
    } else {
      setError('Неверный PIN');
      setPin('');
    }
  },[hydrated, mode, pin, pinEnabled, pinStored, pinLength, pinOk, router, redirectTarget]);

  const runBiometry = useCallback(async ()=>{
    if (mode !== 'unlock' || pinOk) return;
    const payload = biometryPayload?.trim();
    if (!payload) return;

    try {
      if (payload === 'ok') {
        try { localStorage.setItem('pin_ok','1'); } catch {}
        setPinOk(true);
        setError('');
        router.replace(redirectTarget);
        return;
      }

      const nav = navigator as NavigatorWithCredentials;
      if (!nav?.credentials?.get) return;

      const options = JSON.parse(payload) as CredentialRequestOptions;
      const credential = await nav.credentials.get(options);
      if (credential) {
        try { localStorage.setItem('pin_ok','1'); } catch {}
        setPinOk(true);
        setError('');
        router.replace(redirectTarget);
      }
    } catch {}
  },[mode, pinOk, biometryPayload, router, redirectTarget]);

  const press = (value:string)=>{
    if (!hydrated || pinOk) return;
    if (value === 'back') {
      setPin(prev=>prev.slice(0,-1));
      setError('');
      return;
    }
    if (value === 'clear') {
      setPin('');
      setError('');
      return;
    }
    if (!/^\d$/.test(value)) return;
    setPin(prev=>{
      if (prev.length >= pinLength) return prev;
      return prev + value;
    });
    setError('');
  };

  return (
    <div style={{maxWidth:420, margin:'32px auto'}}>
      <div style={{textAlign:'center',margin:'24px 0 8px',fontSize:22,fontWeight:700}}>{mode==='set'?'Создайте PIN-код':'Введите PIN-код'}</div>
      <div className="dotRow">{
        Array.from({length:pinLength}).map((_,i)=> (
          <div key={i} className={`dot ${pin.length>i?'on':''}`}/>
        ))
      }</div>
      {error && (
        <div style={{color:'#dc2626', textAlign:'center', fontSize:12, marginTop:8}}>{error}</div>
      )}
      <div className="keypad">
        {['1','2','3','4','5','6','7','8','9','back','0','clear'].map((k,i)=>(
          <button key={i} className={`key${k==='0'?' big':''}`} onClick={()=>press(k)}>
            {k==='back'?'←':k==='clear'?'✕':k}
          </button>
        ))}
      </div>
      {canUseBiometry && (
        <button
          type="button"
          onClick={runBiometry}
          style={{
            width:'100%',
            marginTop:12,
            padding:'10px 12px',
            borderRadius:12,
            border:'1px solid rgba(45,108,246,.35)',
            background:'rgba(45,108,246,.08)',
            color:'#2d6cf6',
            fontWeight:600
          }}
        >
          Разблокировать биометрией
        </button>
      )}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
        <a href="/profile" className="muted">Выйти</a>
        <span className="muted">{pin.length}/{pinLength}</span>
      </div>
    </div>
  );
}
