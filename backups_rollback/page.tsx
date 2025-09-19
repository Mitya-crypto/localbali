'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage(){
  const [hide, setHide] = useState(false);
  const [user, setUser] = useState('@mityya_La');

  useEffect(()=>{ 
    try{
      setHide(localStorage.getItem('hideBalance')==='1');
      const u = localStorage.getItem('username') || '@mityya_La';
      setUser(u.startsWith('@')?u:'@'+u);
    }catch{}
  },[]);

  const toggle = ()=>setHide(v=>{ const n=!v; try{ localStorage.setItem('hideBalance', n?'1':'0'); }catch{}; return n; });

  return (
    <div style={{maxWidth:480, margin:'0 auto 96px'}}>
      {/* HERO */}
      <section className="home-hero">
        <div className="hero-top">
          <div className="user-chip">
            <div className="ava" aria-hidden></div>
            <div style={{fontWeight:800}}>{user}</div>
          </div>
          <div className="badge-beta">beta ⓘ</div>
        </div>

        <div style={{marginTop:10}}>
          <span className="success-pill">✓ Success — </span>
        </div>

        <div className="hero-balance">
          <h2>Общий баланс <button onClick={toggle} className="btn btn-ghost" style={{marginLeft:6}}>👁</button></h2>
          <div className="hero-amount">{hide ? '• • • ₽' : '0.0 ₽'}</div>
        </div>

        {/* Quick actions */}
        <div className="quick-grid" aria-label="Quick actions">
          <Action href="/topup"  icon={IconPlus()}   label="Top up" />
          <Action href="/send"   icon={IconArrow()}  label="Send" />
          <Action href="/exchange" icon={IconBank()} label="Sell" dot />
          <Action href="/pay"    icon={IconBasket()} label="Pay" />
        </div>
      </section>

      {/* PROMO */}
      <section className="promo-card">
        <div className="promo-title">До 30% комиссии</div>
        <div className="promo-sub">from each friend’s payment</div>
        <button className="btn-invite">Пригласить</button>
      </section>

      <div className="dots"><span className="dot active"></span><span className="dot"></span></div>

      {/* ASSETS */}
      <div className="asset-card">
        <div className="asset-row">
          <div className="asset-ico ico-usdt">{IconTether()}</div>
          <div>
            <div className="asset-name">USDT</div>
            <div className="asset-sub">79.5 ₽</div>
          </div>
          <div className="asset-right">
            <div className="asset-amount">0.0 ₽</div>
            <div className="asset-sub">0.0 USDT</div>
          </div>
        </div>
      </div>

      <div className="asset-card">
        <div className="asset-row">
          <div className="asset-ico ico-ton">{IconTon()}</div>
          <div>
            <div className="asset-name">TON <span className="badge-new">NEW</span></div>
            <div className="asset-sub">240.36 ₽</div>
          </div>
          <div className="asset-right">
            <div className="asset-amount">0.0 ₽</div>
            <div className="asset-sub">0.0 TON</div>
          </div>
        </div>
      </div>

      <div className="asset-card asset-disabled">
        <div className="asset-row">
          <div className="asset-ico ico-btc">{IconBtc()}</div>
          <div>
            <div className="asset-name">BTC</div>
          </div>
          <div className="asset-right">
            <span className="badge-soon">Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Action({href, icon, label, dot}:{href:string; icon:React.ReactNode; label:string; dot?:boolean}){
  return (
    <Link href={href} className="action">
      <div className="qtile">{dot && <span className="dot" />}<span aria-hidden>{icon}</span></div>
      <div className="qtitle">{label}</div>
    </Link>
  );
}

/* === SVG иконки === */
function IconPlus(){return(<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6CF6" strokeWidth="2.2"><circle cx="12" cy="12" r="9" stroke="#e5e7eb" fill="none"/><path d="M12 8v8M8 12h8"/></svg>);}
function IconArrow(){return(<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6CF6" strokeWidth="2.2"><circle cx="12" cy="12" r="9" stroke="#e5e7eb" fill="none"/><path d="M8 12h8M13 9l3 3-3 3"/></svg>);}
function IconBank(){return(<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6CF6" strokeWidth="2.2"><rect x="5" y="10" width="14" height="9" rx="2" stroke="#e5e7eb"/><path d="M5 10h14M8 13v4M12 13v4M16 13v4"/><path d="M4 10l8-5 8 5" stroke="#2D6CF6"/></svg>);}
function IconBasket(){return(<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6CF6" strokeWidth="2.2"><circle cx="12" cy="12" r="9" stroke="#e5e7eb" fill="none"/><path d="M7 10h10l-1 7H8l-1-7Z"/><path d="M9 10l3-4 3 4"/></svg>);}
function IconTether(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.25)"/><path d="M7 8h10M9 8v3c0 1.7 6 1.7 6 0V8" stroke="white"/><path d="M12 11v6" stroke="white"/></svg>);}
function IconTon(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M12 4l7 6-7 10L5 10l7-6z"/></svg>);}
function IconBtc(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M10 8h4a2 2 0 1 1 0 4h-4V8zm0 4h4a2 2 0 1 1 0 4h-4v-4z"/></svg>);}
