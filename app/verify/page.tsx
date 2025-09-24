'use client';

import { useTelegramUser } from '@/lib/useTelegramUser';

export default function Verify() {
  const { displayName, initials, photoUrl, source } = useTelegramUser();
  const plainName = displayName.replace(/^@/, '').trim();
  const hasPersonalGreeting = source !== 'placeholder' && plainName.length > 0;
  const heading = hasPersonalGreeting ? `Привет, ${plainName}!` : 'Добро пожаловать в CryptoBali';
  const subtitle = hasPersonalGreeting
    ? 'Это CryptoBali — сервис платежей и P2P-инструментов. Начнём?'
    : 'Мы — сервис платежей и P2P-инструментов. Войдите через Telegram Web App.';

  return (
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        fontFamily: 'system-ui',
        padding: '0 16px',
        textAlign: 'center',
      }}
    >
      {hasPersonalGreeting && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontWeight: 800,
              color: '#052235',
            }}
            aria-hidden={photoUrl ? undefined : true}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 24 }}>{initials}</span>
            )}
          </div>
          <div style={{ fontWeight: 800 }} title={displayName}>
            {displayName}
          </div>
        </div>
      )}
      <h1 style={{ margin: 0 }}>{heading}</h1>
      <div style={{ color: 'var(--muted)' }}>{subtitle}</div>
      <a
        href="/pin?mode=set"
        style={{
          marginTop: 8,
          padding: '10px 14px',
          border: '1px solid var(--primary)',
          borderRadius: 12,
          textDecoration: 'none',
          color: 'var(--text)',
        }}
      >
        Создать быстрый доступ (PIN)
      </a>
    </div>
  );
}
