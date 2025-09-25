'use client';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import TabBar from '@/components/ui/TabBar';

function Section({title}:{title:string}) {
  return <div style={{padding:'16px 16px 8px',color:'#6b7280',fontSize:12,fontWeight:700}}>{title.toUpperCase()}</div>;
}

export default function SecurityPage(){
  const { t } = useI18n();
  const [pin, setPin] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(()=>{
    try { setPin(localStorage.getItem('pinHash') ? true : false); } catch {}
    try { setHide(localStorage.getItem('hideBalance') === '1'); } catch {}
  },[]);

  const togglePin = ()=>{
    const v = !pin; setPin(v);
    if (!v) localStorage.removeItem('pinHash');
  };
  const toggleHide = ()=>{
    const v = !hide; setHide(v);
    try { localStorage.setItem('hideBalance', v ? '1':'0'); window.dispatchEvent(new Event('pref:hideBalance')); } catch {}
  };

  return (
    <div style={{minHeight:'100svh',background:'#f7f8fa',fontFamily:'system-ui',display:'flex',flexDirection:'column'}}>
      <div style={{position:'sticky',top:0,background:'#fff',borderBottom:'1px solid #eee',padding:'12px 14px',fontWeight:800}}>
        {t('settings.security.title')}
      </div>

      <Section title={t('profile.parameters')}/>
      <div style={{background:'#fff',border:'1px solid #eee',borderRadius:16,margin:'0 14px',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px',borderTop:'1px solid #f1f5f9'}}>
          <div style={{width:36,height:36,borderRadius:10,background:'#e9f2ff',display:'flex',alignItems:'center',justifyContent:'center'}}>🔑</div>
          <div style={{fontWeight:700}}>{t('settings.security.pin')}</div>
          <div style={{marginLeft:'auto'}}>
            <label style={{display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked={pin} onChange={togglePin}/>
              <span>{pin ? 'On' : 'Off'}</span>
            </label>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px',borderTop:'1px solid #f1f5f9'}}>
          <div style={{width:36,height:36,borderRadius:10,background:'#e9f2ff',display:'flex',alignItems:'center',justifyContent:'center'}}>🙈</div>
          <div style={{fontWeight:700}}>{t('settings.security.hideBalance')}</div>
          <div style={{marginLeft:'auto'}}>
            <label style={{display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked={hide} onChange={toggleHide}/>
              <span>{hide ? 'On' : 'Off'}</span>
            </label>
          </div>
        </div>
      </div>

      <div style={{height:12}}/>
      <TabBar current="profile"/>
    </div>
  );
}
