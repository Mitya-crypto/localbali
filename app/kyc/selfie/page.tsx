'use client';
import React from 'react';
export default function SelfieKyc(){ return (
  <div className="container" style={{maxWidth:480, margin:'16px auto 96px', padding:'0 16px'}}>
    <section className="card" style={{display:'grid', gap:10, padding:'16px'}}>
      <h1 style={{margin:0, fontSize:18, fontWeight:900}}>Селфи с документом</h1>
      <p className="meta">Экран-заглушка. Здесь остаётся ваша камера/загрузка.</p>
    </section>
  </div>
); }
