// @ts-nocheck
'use client';
import { usePathname } from 'next/navigation';
import s from './TabBar.module.css';
import React from 'react';

const GRAY = '#9ca3af';
const SKY  = '#0284c7';
const WHITE= '#ffffff';
const dataSvg = (svg: string) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

const homeSvg  = (c: string) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="${c}" d="M2.5 11.2 12 3l9.5 8.2v8.8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 20V11.2Z"/>
  <rect fill="${c}" x="10" y="14" width="4" height="6" rx="1"/></svg>`;
const histSvg  = (c: string) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect fill="${c}" x="3" y="4" width="18" height="16" rx="2"/>
  <rect fill="${c}" x="7" y="2" width="2" height="6" rx="1"/>
  <rect fill="${c}" x="15" y="2" width="2" height="6" rx="1"/>
  <rect fill="${c}" x="3" y="8" width="18" height="2"/>
  <rect fill="${c}" x="6.5" y="13" width="5" height="2" rx="1"/>
  <rect fill="${c}" x="12.5" y="13" width="5" height="2" rx="1"/>
  <rect fill="${c}" x="6.5" y="16" width="8" height="2" rx="1"/></svg>`;
const investSvg= (c: string) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect fill="${c}" x="5" y="11" width="3" height="9" rx="1"/>
  <rect fill="${c}" x="10.5" y="8" width="3" height="12" rx="1"/>
  <rect fill="${c}" x="16" y="13" width="3" height="7" rx="1"/>
  <rect fill="${c}" x="3" y="20" width="18" height="2" rx="1"/></svg>`;
const profSvg  = (c: string) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect fill="${c}" x="4" y="3" width="16" height="18" rx="3"/>
  <circle fill="${c}" cx="12" cy="9" r="3.8"/>
  <path fill="${c}" d="M6.5 18.5c2.1-2.6 4.3-3.9 5.5-3.9s3.4 1.3 5.5 3.9v1H6.5z"/></svg>`;
const scanSvgStrokeWhite = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 7V5h3"/><path d="M17 4h3v3"/><path d="M20 17v2h-3"/><path d="M7 20H5v-3"/><rect x="8" y="8" width="8" height="8" rx="2"/>
  </g></svg>`;

function IconImg({src, alt, big=false}:{src:string;alt:string;big?:boolean}) {
  return <img src={src} alt={alt} className={big ? s.bigImg : s.iconImg} draggable={false} />;
}

export default function TabBar() {
  const p = usePathname() || '/';
  // Скрываем на полноэкранных: scan/verify/pin и (по просьбе) profile
  if (p.startsWith('/verify') || p.startsWith('/pin') || p.startsWith('/scan')) return null;

  const is = (x:string) => p === x || p.startsWith(x + '/');
  const Btn = ({href, active, icon, label}:{href:string;active:boolean;icon:React.ReactNode;label:string}) => (
    <a href={href as any} className={s.btn}>
      {icon}
      <span className={active ? s.label + ' ' + s.labelActive : s.label}>{label}</span>
    </a>
  );

  const homeSrc   = dataSvg(homeSvg(is('/home') ? SKY : GRAY));
  const histSrc   = dataSvg(histSvg(is('/history') ? SKY : GRAY));
  const investSrc = dataSvg(investSvg(is('/invest') ? SKY : GRAY));
  const profSrc   = dataSvg(profSvg(is('/profile') ? SKY : GRAY));
  const scanSrc   = dataSvg(scanSvgStrokeWhite);

  return (
    <nav className={s.tabbar} aria-label="Навигация приложения">
      <div className={s.row}>
        <Btn href="/home"    active={is('/home')}    icon={<IconImg src={homeSrc}   alt="" />} label="Главная" />
        <Btn href="/history" active={is('/history')} icon={<IconImg src={histSrc}   alt="" />} label="История" />
        <div className={s.slot}>
          <a href="/scan" aria-label="Скан" className={s.bigBtn}><IconImg src={scanSrc} alt="" big /></a>
        </div>
        <Btn href="/invest"  active={is('/invest')}  icon={<IconImg src={investSrc} alt="" />} label="Инвестиции" />
        <Btn href="/profile" active={is('/profile')} icon={<IconImg src={profSrc}   alt="" />} label="Профиль" />
      </div>
      <div className={s.safe} />
    </nav>
  );
}
