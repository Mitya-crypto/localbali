'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { tr } from '../../../components/ui/tr';

export default function SecurityPage(){
  const [email,setEmail] = useState<string|undefined>();
  const [verified,setVerified] = useState(false);
  const [pin,setPin] = useState(false);
  const [face,setFace] = useState(false);
  const [faceSupported,setFaceSupported] = useState(true);
  const [hide,setHide] = useState(false);

  useEffect(()=>{ try{
    setEmail(localStorage.getItem('userEmail')||undefined);
    setVerified(localStorage.getItem('userEmailVerified')==='1');
    setPin(localStorage.getItem('pin_enabled')==='1');
    setFace(localStorage.getItem('faceid_enabled')==='1');
    setHide(localStorage.getItem('hideBalance')==='1');
  }catch{} },[]);

  useEffect(()=>{
    let cancelled = false;
    const manager = (window as any)?.Telegram?.WebApp?.BiometricsManager;
    if (!manager) {
      setFaceSupported(false);
      return;
    }
    const detect = async () => {
      try {
        const availableRes = await manager.isBiometricsAvailable?.();
        if (!availableRes?.available) {
          if (!cancelled) setFaceSupported(false);
          return;
        }
        const enrolledRes = await manager.isBiometricsEnrolled?.();
        if (!cancelled) {
          const allowed = enrolledRes ? Boolean(enrolledRes.enrolled || enrolledRes.canEnroll) : true;
          setFaceSupported(allowed);
        }
      } catch {
        if (!cancelled) setFaceSupported(false);
      }
    };
    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(()=>{
    const sync = () => {
      try {
        setPin(localStorage.getItem('pin_enabled')==='1');
        setHide(localStorage.getItem('hideBalance')==='1');
        setFace(localStorage.getItem('faceid_enabled')==='1');
      } catch{}
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const toggle = (key:string, setter: React.Dispatch<React.SetStateAction<boolean>>)=>()=>{
    setter(v=>{ const n=!v; try{ localStorage.setItem(key, n?'1':'0'); }catch{}; return n; });
  };

  const toggleFace = useCallback(()=>{
    if (!faceSupported) return;
    setFace(v=>{
      const next=!v;
      try{
        localStorage.setItem('faceid_enabled', next?'1':'0');
        if (!next) localStorage.removeItem('pin_ok');
      }catch{}
      return next;
    });
  },[faceSupported]);

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px', padding:'12px 16px'}}>
      <h1 className="sect-title" style={{marginTop:4}}>{tr('security','title','Безопасность')}</h1>
      <div className="list-card">
        <div className="list-row">
          <span className="row-ico">{IconMail()}</span>
          <span className="row-label">{tr('profile','email','E-mail')}</span>
          <span className="row-value" style={{marginLeft:'auto'}}>{
            email ? (verified ? tr('profile','email_ok','Подтверждён') : tr('profile','email_verify','Подтвердить')) : tr('profile','email_add','Добавить')
          }</span>
        </div>
      </div>

      <h2 className="sect-title">{tr('security','subtitle','E-mail, PIN, приватность')}</h2>
      <div className="list-card">
        <div className="list-row">
          <span className="row-ico">{IconPin()}</span>
          <span className="row-label">{pin?tr('security','pin_on','PIN: включён'):tr('security','pin_off','PIN: выключен')}</span>
          <button className="row-pill" data-on={pin?1:0} onClick={toggle('pin_enabled', setPin)}>{tr('security','toggle_pin','Переключить PIN')}</button>
        </div>
        <div className="list-row">
          <span className="row-ico">{IconFace()}</span>
          <span className="row-label">
            {faceSupported
              ? (face ? 'Face ID: включён' : 'Face ID: выключен')
              : 'Face ID: недоступен'}
          </span>
          <button
            type="button"
            className="row-pill"
            data-on={face?1:0}
            onClick={toggleFace}
            disabled={!faceSupported}
          >
            {faceSupported ? (face ? 'Отключить' : 'Включить') : 'Недоступно'}
          </button>
        </div>
        <div className="list-row">
          <span className="row-ico">{IconEye()}</span>
          <span className="row-label">{hide?tr('security','hide_on','Скрывать баланс: да'):tr('security','hide_off','Скрывать баланс: нет')}</span>
          <button className="row-pill" data-on={hide?1:0} onClick={toggle('hideBalance', setHide)}>{tr('security','toggle_hide','Скрывать баланс')}</button>
        </div>
      </div>
    </div>
  );
}

function IconMail(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16v12H4z"/><path d="M4 8l8 6 8-6"/></svg>);}
function IconPin(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>);}
function IconFace(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5a2 2 0 0 1 2-2h2"/><path d="M20 7V5a2 2 0 0 0-2-2h-2"/><path d="M4 17v2a2 2 0 0 0 2 2h2"/><path d="M20 17v2a2 2 0 0 1-2 2h-2"/><path d="M9 10.5c.5-.5 1.1-.8 2-.8s1.5.3 2 .8"/><path d="M13 10.5c.5-.5 1.1-.8 2-.8s1.5.3 2 .8"/><path d="M9 15c.7.7 1.5 1 3 1s2.3-.3 3-1"/></svg>);}
function IconEye(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);}
