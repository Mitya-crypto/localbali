'use client';
import React, { useEffect, useState } from 'react';

import { useTelegramUser } from '@/lib/useTelegramUser';

/* ===== Иконки ===== */
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <rect x="11" y="7" width="2" height="10" rx="1" fill="#fff" />
      <rect x="7" y="11" width="10" height="2" rx="1" fill="#fff" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M7 12h7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function IconBank() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <rect x="6" y="9" width="3" height="7" rx="1" fill="#fff" />
      <rect x="10.5" y="9" width="3" height="7" rx="1" fill="#fff" />
      <rect x="15" y="9" width="3" height="7" rx="1" fill="#fff" />
    </svg>
  );
}
function IconBasket() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <rect x="3" y="8" width="18" height="12" rx="3" />
      <path d="M8 8l3-4M16 8l-3-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ===== Кнопка быстрого действия ===== */
function Action({
  href,
  icon,
  label,
  dot,
}: {
  href: string; // ключевое: тип Route вместо string
  icon: React.ReactNode;
  label: string;
  dot?: boolean;
}) {
  return (
    <a href={href as any} className="action" style={{ textDecoration: 'none' }}>
      <div className="qtile">
        {dot && <span className="dot" />}
        <span aria-hidden>{icon}</span>
      </div>
      <div className="qtitle">{label}</div>
    </a>
  );
}

export default function HomePage() {
  const [hide, setHide] = useState(false);
  const { displayName, photoUrl, initials } = useTelegramUser();
  const [userLabel, setUserLabel] = useState(displayName);
  const [avatarUrl, setAvatarUrl] = useState(photoUrl);
  const [avatarInitials, setAvatarInitials] = useState(initials);

  useEffect(() => {
    try {
      setHide(localStorage.getItem('hideBalance') === '1');
    } catch {}
  }, []);

  useEffect(() => {
    setUserLabel((prev) => (prev === displayName ? prev : displayName));
    setAvatarUrl((prev) => (prev === photoUrl ? prev : photoUrl));
    setAvatarInitials((prev) => (prev === initials ? prev : initials));
  }, [displayName, photoUrl, initials]);

  const toggle = () =>
    setHide((v) => {
      const n = !v;
      try {
        localStorage.setItem('hideBalance', n ? '1' : '0');
      } catch {}
      return n;
    });

  return (
    <div style={{ maxWidth: 480, margin: '0 auto 96px' }}>
      {/* HERO */}
      <section className="home-hero">
        <div className="hero-top">
          <div className="user-chip">
            <div className="ava" aria-hidden={avatarUrl ? undefined : true}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" loading="lazy" />
              ) : (
                <span>{avatarInitials}</span>
              )}
            </div>
            <div style={{ fontWeight: 800 }} title={userLabel}>
              {userLabel}
            </div>
          </div>
          <div className="badge-beta">beta ⓘ</div>
        </div>

        <div style={{ marginTop: 10 }}>
          <span className="success-pill"> — </span>
        </div>

        <div className="hero-balance">
          <h2>
            Общий баланс{' '}
            <button onClick={toggle} className="btn btn-ghost" style={{ marginLeft: 6 }}>
              👁
            </button>
          </h2>
          <div className="hero-amount">{hide ? '• • • ₽' : '0.0 ₽'}</div>
        </div>

        {/* Quick actions */}
        <div className="quick-grid" aria-label="Quick actions">
          <Action href="/topup" icon={<IconPlus />} label="Пополнить" />
          <Action href="/send" icon={<IconArrow />} label="Отправить" />
          <Action href="/exchange" icon={<IconBank />} label="Обмен валют" dot />
          <Action href="/pay" icon={<IconBasket />} label="Оплата" />
        </div>
      </section>

      {/* PROMO */}
      <section className="promo-card">
        <div className="promo-title">До 30% комиссии</div>
        {/* ...дальше твой контент... */}
      </section>
    </div>
  );
}
