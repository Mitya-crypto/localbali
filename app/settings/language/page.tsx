'use client';
import { useRouter } from 'next/navigation';
import { useI18n } from '../../../components/providers/I18nProvider';
import type { Lang } from '../../../lib/i18n';

const LIST: {code:Lang}[] = [ {code:'ru'},{code:'en'},{code:'id'},{code:'es'},{code:'de'} ];

export default function LanguagePage(){
  const {lang,setLang,t,label,flag} = useI18n();
  const router = useRouter();
  const choose = (l:Lang) => { setLang(l); };

  return (
    <div style={{minHeight:'100svh',background:'var(--bg)',color:'var(--text)',fontFamily:'system-ui'}}>
      <div style={{position:'sticky',top:0,background:'var(--card)',borderBottom:'1px solid var(--border)',padding:'12px 14px',display:'flex',alignItems:'center',gap:8}}>
        <button onClick={()=>router.back()} style={{border:0,background:'transparent',cursor:'pointer',color:'var(--text)'}}>← {t('lang.back')}</button>
        <div style={{marginLeft:8,fontWeight:800}}>{t('lang.title')}</div>
      </div>

      <div style={{padding:16}}>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
          {LIST.map((it, i) => (
            <button key={it.code} onClick={()=>choose(it.code)}
              style={{display:'flex',alignItems:'center',gap:12,width:'100%',textAlign:'left',padding:'14px',border:0,background:'transparent',borderTop: i? '1px solid var(--border)' : 'none',cursor:'pointer', color:'var(--text)'}}>
              <div style={{fontSize:22,width:28}}>{flag(it.code as Lang)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{label(it.code as Lang)}</div>
                {lang===it.code ? <div style={{fontSize:12,color:'var(--muted)'}}>{t('lang.current')}</div> : null}
              </div>
              {lang===it.code ? <div>✓</div> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
