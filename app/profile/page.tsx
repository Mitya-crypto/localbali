'use client';
import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { getUser } from '@/lib/tg';
import TabBar from '@/components/ui/TabBar';
import { useI18n } from '@/components/providers/I18nProvider';
import { LANG_LABEL, type Lang } from '@/lib/i18n';

function Row({icon, title, right, href}:{icon:string; title:string; right?:string; href?:Route}) {
  const C = (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'14px',
      background:'#fff', borderTop:'1px solid #f1f5f9'
    }}>
      <div style={{
        width:36, height:36, borderRadius:10, background:'#e9f2ff',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18
      }}>{icon}</div>
      <div style={{fontWeight:700}}>{title}</div>
      <div style={{marginLeft:'auto', color:'#9aa4b2'}}>{right}</div>
      <div style={{marginLeft:8, color:'#9aa4b2'}}>›</div>
    </div>
  );
  return href ? <Link href={href} style={{textDecoration:'none', color:'inherit'}}>{C}</Link> : C;
}

export default function ProfilePage(){
  const u = useMemo(()=>getUser(),[]);
  const { t, lang } = useI18n();
  const [deviceCount, setDeviceCount] = useState(1);

  useEffect(()=>{ try{
    const list = JSON.parse(localStorage.getItem('devices') || '[]');
    if (Array.isArray(list)) setDeviceCount(Math.max(1, list.length));
  }catch{} },[]);

  return (
    <div style={{minHeight:'100svh', background:'#f7f8fa', fontFamily:'system-ui', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'12px 14px 0', background:'#f7f8fa'}}>
        <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:14, display:'flex', gap:12, alignItems:'center'}}>
          <div style={{width:54, height:54, borderRadius:999, background:'#e9f2ff'}}/>
          <div style={{display:'flex', flexDirection:'column', lineHeight:1.2}}>
            <div style={{fontWeight:800, fontSize:20}}>@{u?.username || 'user'}</div>
            <div style={{color:'#9aa4b2'}}>Junior</div>
          </div>
        </div>
      </div>

      <div style={{padding:'12px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:14}}>
          <div style={{fontWeight:800}}>{t('profile.kyc')}</div>
          <div style={{marginTop:6, color:'#9aa4b2'}}>Pass ›</div>
        </div>
        <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:14}}>
          <div style={{fontWeight:800}}>{t('profile.email')}</div>
           <div style={{marginTop:6, color:'#9aa4b2'}}>{t('profile.add')} ›</div>
        </div>
      </div>

      <div style={{padding:'0 14px'}}>
        <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, overflow:'hidden'}}>
          <Row icon="👥" title={t('profile.ref')}    href="/referrals" />
          <Row icon="🎁" title={t('profile.promos')} href="/promos"  />
        </div>
      </div>

      <div style={{padding:'14px 14px 0', color:'#9aa4b2', fontWeight:800}}>{t('profile.parameters').toUpperCase()}</div>
      <div style={{padding:'0 14px'}}>
        <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, overflow:'hidden'}}>
          <Row icon="🔒" title={t('profile.security')} href="/settings/security" />
          <Row icon="🌐" title={t('profile.language')} right={LANG_LABEL[lang as Lang]} href="/settings/language" />
          <Row icon="💻" title={t('profile.devices')}  right={String(deviceCount)} href="/settings/devices" />
        </div>
      </div>

      <div style={{padding:'14px 14px 0', color:'#9aa4b2', fontWeight:800}}>{t('profile.about').toUpperCase()}</div>
      <div style={{padding:'0 14px'}}>
        <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, overflow:'hidden'}}>
          <Row icon="📣" title={t('profile.official')} />
          <Row icon="❓" title={t('profile.faq')} />
          <Row icon="ℹ️" title={t('profile.info')} />
          <Row icon="💬" title={t('profile.support')} />
        </div>
      </div>

      <div style={{height:12}}/>
      <TabBar current="profile" />
    </div>
  );
}
