'use client';
import React, { useEffect, useState } from 'react';
import { tr } from '../../../components/ui/tr';

export default function SecurityPage(){
  const [email,setEmail] = useState<string|undefined>();
  const [verified,setVerified] = useState(false);
  const [pin,setPin] = useState(false);
  const [hide,setHide] = useState(false);

  useEffect(()=>{ try{
    setEmail(localStorage.getItem('userEmail')||undefined);
    setVerified(localStorage.getItem('userEmailVerified')==='1');
    setPin(localStorage.getItem('pin_enabled')==='1');
    setHide(localStorage.getItem('hideBalance')==='1');
  }catch{} },[]);

  const toggle = (key:string, setter: React.Dispatch<React.SetStateAction<boolean>>)=>()=>{
    setter(v=>{ const n=!v; try{ localStorage.setItem(key, n?'1':'0'); }catch{}; return n; });
  };

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
function IconEye(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);}
