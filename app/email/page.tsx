'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  validateEmailFormat, suggestDomainFor, isDisposableDomain,
  startVerification, verifyCode, getEmail, splitEmail
} from '../../lib/email-util';

export default function EmailPage(){
  const router = useRouter();
  const [{email, sent, demoCode, error, info, code}, set] = useState({
    email:'', sent:false, demoCode:'', error:'', info:'', code:''
  });

  useEffect(()=>{
    const { email: current } = getEmail();
    if(current){ 
      // уже есть e-mail — редактирование
      set(s=>({...s, email: current!}));
    }
  },[]);

  const suggestion = useMemo(()=> email ? suggestDomainFor(email) : null, [email]);
  const disposable = useMemo(()=> {
    const {domain} = splitEmail(email||'');
    return domain ? isDisposableDomain(domain) : false;
  }, [email]);

  const onSend = ()=>{
    const e = email.trim();
    if(!validateEmailFormat(e)){
      set(s=>({...s, error:'Введите корректный e-mail', info:''}));
      return;
    }
    const {code} = startVerification(e, 600);
    set(s=>({...s, sent:true, demoCode:code, error:'', info:'Код отправлен (демо). Введите 6 цифр ниже.'}));
  };

  const onVerify = ()=>{
    const res = verifyCode(code);
    if(!res.ok){
      const map: Record<string,string> = {
        'expired':'Срок действия кода истёк. Отправьте ещё раз.',
        'mismatch':'Неверный код. Проверьте и попробуйте снова.',
        'no-session':'Нет активной сессии подтверждения. Отправьте код заново.'
      };
      set(s=>({...s, error: map[res.reason||'mismatch'] || 'Не удалось подтвердить код'}));
      return;
    }
    // success → назад в профиль
    router.push('/profile' as any);
  };

  const onResend = ()=> onSend();

  return (
    <div className="vstack" style={{gap:16}}>
      <div className="topbar"><Link href="/profile">← Профиль</Link></div>

      <div className="card vstack" style={{gap:12}}>
        <label htmlFor="email"><b>E-mail</b></label>
        <input
          id="email" type="email" placeholder="you@example.com" value={email}
          onChange={e=>set(s=>({...s, email:e.target.value, error:'', info:''}))}
          style={{padding:'12px', border:'1px solid var(--border)', borderRadius:'12px',
                  background:'var(--card)', color:'var(--text)'}}
        />

        {suggestion && (
          <div className="li" style={{marginTop:4}}>
            <div className="left">
              <div className="li circle">💡</div>
              <div>
                <b>Похоже, опечатка</b>
                <div className="muted" style={{fontSize:12}}>Возможно, вы имели в виду <code>{email.split('@')[0]}@{suggestion}</code></div>
              </div>
            </div>
            <button className="btn" onClick={()=>{
              const local = email.split('@')[0] || '';
              set(s=>({...s, email: `${local}@${suggestion}`}));
            }}>Исправить</button>
          </div>
        )}

        {disposable && (
          <div className="li" style={{marginTop:4, borderColor:'var(--warning)'}}>
            <div className="left">
              <div className="li circle">⚠️</div>
              <div>
                <b>Одноразовый домен</b>
                <div className="muted" style={{fontSize:12}}>Такие адреса часто недоступны для восстановления доступа.</div>
              </div>
            </div>
          </div>
        )}

        {!sent ? (
          <button className="btn primary" onClick={onSend}>Отправить код</button>
        ) : (
          <div className="vstack" style={{gap:8}}>
            <label htmlFor="code"><b>Код из письма</b></label>
            <input
              id="code" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="6 цифр"
              value={code} onChange={e=>set(s=>({...s, code:e.target.value.replace(/\D/g,'')}))}
              style={{padding:'12px', border:'1px solid var(--border)', borderRadius:'12px',
                      letterSpacing:'6px', textAlign:'center', fontSize:18}}
            />
            <div className="hstack" style={{justifyContent:'space-between'}}>
              <button className="btn" onClick={onResend}>Отправить ещё раз</button>
              <button className="btn primary" onClick={onVerify}>Подтвердить</button>
            </div>
            <div className="muted" style={{fontSize:12}}>
              Для демо: код <b>{demoCode}</b> (в реальном приложении он придёт письмом).
            </div>
          </div>
        )}

        {error && <div className="muted" style={{color:'var(--danger)'}}>{error}</div>}
        {info && !error && <div className="muted">{info}</div>}
      </div>

      <div className="card muted" style={{fontSize:12}}>
        Без бэкенда e-mail подтверждается локально. Для реальной отправки писем нужен сервер/SMTP.
      </div>
    </div>
  );
}
