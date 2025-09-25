'use client';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';

export default function TabBar({current}:{current?:'home'|'history'|'scan'|'invest'|'profile'}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const cur = current || (pathname.startsWith('/profile') ? 'profile'
               : pathname.startsWith('/history') ? 'history'
               : pathname.startsWith('/invest') ? 'invest'
               : pathname === '/scan' ? 'scan' : 'home');

  const Item = ({href, label, active}:{href:Route; label:string; active:boolean}) => (
    <Link href={href} style={{
      flex:1, textAlign:'center', textDecoration:'none',
      color: active ? '#0b1628' : '#7e8a9d', fontWeight: active ? 700 : 600
    }}>
      <div style={{
        width:46, height:46, margin:'0 auto 4px', borderRadius:12,
        background: active ? '#e7f0ff' : '#f3f5f9', display:'flex',
        alignItems:'center', justifyContent:'center', fontSize:20
      }}>⬤</div>
      <div style={{fontSize:12}}>{label}</div>
    </Link>
  );

  return (
    <div style={{
      position:'sticky', bottom:0, width:'100%', background:'#fff',
      borderTop:'1px solid #e6e8ee', padding:'8px 10px 10px',
      display:'flex', gap:6
    }}>
      <Item href="/home"    label={t('tab.home')}    active={cur==='home'} />
      <Item href="/history" label={t('tab.history')} active={cur==='history'} />
      <Item href="/scan"    label={t('tab.scan')}    active={cur==='scan'} />
      <Item href="/invest"  label={t('tab.invest')}  active={cur==='invest'} />
      <Item href="/profile" label={t('tab.profile')} active={cur==='profile'} />
    </div>
  );
}
