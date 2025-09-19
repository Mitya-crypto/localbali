'use client';

export default function Verify(){
  return (
    <div style={{
      minHeight:'100svh',
      background:'var(--bg)',
      color:'var(--text)',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      gap:14,
      fontFamily:'system-ui',
      padding:'0 16px',
      textAlign:'center'
    }}>
      <h1 style={{margin:0}}>Добро пожаловать в CryptoBali</h1>
      <div style={{color:'var(--muted)'}}>
        Мы — сервис платежей и P2P-инструментов. Войдите через Telegram Web App.
      </div>
      <a
        href="/pin?mode=set"
        style={{
          marginTop:8,
          padding:'10px 14px',
          border:'1px solid var(--primary)',
          borderRadius:12,
          textDecoration:'none',
          color:'var(--text)'
        }}
      >
        Создать быстрый доступ (PIN)
      </a>
    </div>
  );
}
