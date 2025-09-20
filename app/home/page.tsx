'use client';
import React, { useEffect, useMemo, useState } from 'react';
import TabBar from '@/components/ui/TabBar';
import { getUser, TGUser } from '@/lib/tg';
import { useI18n } from '@/components/providers/I18nProvider';

function Chip({text,bg,color}:{text:string;bg:string;color:string}) {
  return <div style={{padding:'6px 10px',borderRadius:12,fontSize:12,fontWeight:700,background:bg,color}}>{text}</div>;
}
function Eye({on}:{on:()=>void}) {
  return <button onClick={on} style={{border:0,background:'transparent',padding:4,cursor:'pointer'}}>👁️</button>;
}
function Action({label,onClick}:{label:string;onClick:()=>void}) {
  return (
    <button onClick={onClick} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:84,borderRadius:14,background:'#fff',border:'1px solid #e6e8ee',gap:8}}>
      <div style={{fontSize:24}}>●</div>
      <div style={{fontSize:13,color:'#0b1628',fontWeight:600}}>{label}</div>
    </button>
  );
}
function AssetRow({code,fiat,amountFiat,amountCoin,disabled}:{code:'USDT'|'TON'|'BTC';fiat:string;amountFiat:string;amountCoin:string;disabled?:boolean}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px',opacity:disabled? .5:1,background:'#fff',borderTop:'1px solid #f1f5f9'}}>
      <div style={{width:40,height:40,borderRadius:999,background:'#f1f5ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
        {code==='USDT'?'₮':code==='TON'?'◇':'฿'}
      </div>
      <div style={{display:'flex',flexDirection:'column'}}>
        <div style={{fontWeight:800}}>{code}</div>
        <div style={{fontSize:13,color:'#98a1b3'}}>{fiat}</div>
      </div>
      <div style={{marginLeft:'auto',textAlign:'right'}}>
        <div style={{fontWeight:800}}>{amountFiat}</div>
        <div style={{fontSize:13,color:'#98a1b3'}}>{amountCoin}</div>
      </div>
    </div>
  );
}

export default function HomePage(){
  const initialUser = useMemo(()=>getUser(),[]);
  const [user, setUser] = useState<TGUser | null>(initialUser);
  const [isUserLoading, setIsUserLoading] = useState(!initialUser?.id);
  const { t } = useI18n();

  // Показ/скрытие баланса — синк с localStorage('pref:hideBalance')
  const [show, setShow] = useState(true);
  useEffect(() => {
    const read = () => {
      try {
        const hidden = localStorage.getItem('pref:hideBalance') === '1';
        setShow(!hidden);
      } catch {}
    };
    read();
    const on = () => read();
    window.addEventListener('storage', on);
    window.addEventListener('pref:hideBalance', on as any);
    return () => {
      window.removeEventListener('storage', on);
      window.removeEventListener('pref:hideBalance', on as any);
    };
  }, []);
  const toggleEye = () => {
    const hidden = localStorage.getItem('pref:hideBalance') === '1';
    const next = hidden ? '0' : '1';
    localStorage.setItem('pref:hideBalance', next);
    window.dispatchEvent(new Event('pref:hideBalance'));
    setShow(next !== '1');
  };

  useEffect(()=>{
    if(user?.id){
      setIsUserLoading(false);
      return;
    }
    setIsUserLoading(true);
    let mounted = true;
    const tryUpdate = () => {
      const next = getUser();
      if(next?.id && mounted){
        setUser(next);
        setIsUserLoading(false);
        return true;
      }
      return false;
    };
    if(tryUpdate()) return;
    const timer = setInterval(()=>{
      if(tryUpdate()) clearInterval(timer);
    },500);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  },[user?.id]);

  const copyRef = async ()=>{
    if(!user?.id){
      alert(t('home.loadingUser')||'User data is still loading. Please try again.');
      return;
    }
    const id = user.id.toString();
    const url = `${location.origin}/pin?ref=${encodeURIComponent(id)}`;
    try{ await navigator.clipboard.writeText(url); alert(t('home.invite')||'Invite'); }catch{ alert(url); }
  };

  const inviteDisabled = !user?.id;
  const inviteLabel = inviteDisabled && isUserLoading ? (t('home.loadingUser')||'Loading...') : (t('home.invite')||'Invite');

  return (
    <div style={{minHeight:'100svh',background:'#f5f7fb',display:'flex',flexDirection:'column',fontFamily:'system-ui'}}>
      {/* header */}
      <div style={{position:'relative',padding:'14px 16px 8px',background:'linear-gradient(180deg, #2c86ff 0%, #3aa6ff 100%)',color:'#fff',borderBottomLeftRadius:18,borderBottomRightRadius:18}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:42,height:42,borderRadius:999,background:'#fff'}}/>
            <div style={{display:'flex',flexDirection:'column',lineHeight:1.15}}>
              <strong style={{fontSize:16}}>{user ? (user.username || user.first_name || 'user') : 'user'}</strong>
              <span style={{fontSize:12,opacity:.9}}>mini-app</span>
            </div>
          </div>
          <Chip text="beta" bg="rgba(255,255,255,.2)" color="#fff"/>
        </div>
        <div style={{position:'absolute',left:'50%',top:10,transform:'translateX(-50%)'}}>
          <Chip text={t('pin.success')||'Success PIN code set'} bg="rgba(255,255,255,.95)" color="#0b1628"/>
        </div>
        <div style={{marginTop:16,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:14,opacity:.95}}>{t('home.total')||'Total balance'}</span>
          <Eye on={toggleEye}/>
          <span style={{marginLeft:'auto',fontSize:13,opacity:.95}}/>
        </div>
        <div style={{fontSize:44,fontWeight:800,letterSpacing:.5,marginTop:2}}>
          {show ? '0.0 ₽' : '•••'}
        </div>
      </div>

      {/* actions */}
      <div style={{padding:'14px 16px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        <Action label="Top up" onClick={()=>alert('Top up')}/>
        <Action label="Send"   onClick={()=>alert('Send')}/>
        <Action label="Sell"   onClick={()=>alert('Sell')}/>
        <Action label="Pay"    onClick={()=>alert('Pay')}/>
      </div>

      {/* referral card */}
      <div style={{padding:'0 16px 8px'}}>
        <div style={{border:'1px solid #e5e7eb',borderRadius:16,overflow:'hidden',background:'#e9f3ff'}}>
          <div style={{padding:'16px'}}>
            <div style={{fontWeight:800,fontSize:16}}>{t('home.promo.title')||'Up to 30% commission'}</div>
            <div style={{fontSize:13,opacity:.75}}>{t('home.promo.sub')||"from each friend's payment"}</div>
            <div style={{marginTop:14,display:'flex',gap:10,alignItems:'center'}}>
              <button
                onClick={copyRef}
                disabled={inviteDisabled}
                style={{padding:'10px 16px',border:'1px solid #0ea5e9',background:'#e0f2fe',borderRadius:12,fontWeight:700,opacity:inviteDisabled?0.6:1,cursor:inviteDisabled?'not-allowed':'pointer'}}
                title={inviteDisabled ? (t('home.loadingUser')||'User data is loading') : undefined}
              >
                {inviteLabel}
              </button>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:6,padding:'6px 0 12px'}}>
            <span style={{width:6,height:6,borderRadius:99,background:'#9ecbff'}}/>
            <span style={{width:6,height:6,borderRadius:99,background:'#257cff'}}/>
            <span style={{width:6,height:6,borderRadius:99,background:'#9ecbff'}}/>
          </div>
        </div>
      </div>

      {/* assets */}
      <div style={{padding:'0 10px 8px'}}>
        <div style={{background:'#fff',border:'1px solid #eceff5',borderRadius:16,overflow:'hidden'}}>
          <div style={{borderTop:'none'}}><AssetRow code="USDT" fiat="79.5 ₽" amountFiat="0.0 ₽" amountCoin="0.0 USDT" /></div>
          <div><AssetRow code="TON"  fiat="240.36 ₽" amountFiat="0.0 ₽" amountCoin="0.0 TON" /></div>
          <div><AssetRow code="BTC"  fiat=""          amountFiat=""      amountCoin=""        /></div>
        </div>
      </div>

      <div style={{height:12}}/>
      <TabBar current="home"/>
    </div>
  );
}
