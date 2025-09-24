'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  validateEmailFormat, suggestDomainFor, isDisposableDomain,
  startVerification, verifyCode, getEmail, splitEmail,
} from '../../lib/email-util';

type State = {
  email: string;
  sent: boolean;
  error: string;
  info: string;
  code: string;
  isSending: boolean;
  isVerifying: boolean;
  expiresAt: number | null;
};

const CODE_LENGTH = 6;

export default function EmailPage(){
  const router = useRouter();
  const [userId, setUserId] = useState<string>('anon');
  const [state, setState] = useState<State>({
    email:'',
    sent:false,
    error:'',
    info:'',
    code:'',
    isSending:false,
    isVerifying:false,
    expiresAt:null,
  });

  const { email, sent, error, info, code, isSending, isVerifying, expiresAt } = state;

  useEffect(()=>{
    try {
      const { email: current } = getEmail();
      if (current) {
        setState(s => ({ ...s, email: current }));
      }
      const storedUser =
        localStorage.getItem('userId') ||
        localStorage.getItem('username') ||
        undefined;
      if (storedUser) {
        const normalized = storedUser.replace(/^@/, '').trim();
        setUserId(normalized || storedUser);
      }
    } catch {}
  },[]);

  const suggestion = useMemo(()=> email ? suggestDomainFor(email) : null, [email]);
  const disposable = useMemo(()=> {
    const {domain} = splitEmail(email||'');
    return domain ? isDisposableDomain(domain) : false;
  }, [email]);

  const expiryLabel = useMemo(()=>{
    if (!expiresAt) return '';
    try {
      return new Date(expiresAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [expiresAt]);

  const setError = (message: string)=>{
    setState(s => ({ ...s, error: message, info: '' }));
  };

  const onSend = async ()=>{
    const trimmed = email.trim();
    if(!validateEmailFormat(trimmed)){
      setError('Введите корректный e-mail');
      return;
    }
    setState(s => ({ ...s, isSending:true, error:'', info:'Отправляем код…' }));
    const res = await startVerification(trimmed, { ttlSeconds: 600, userId });
    if(!res.ok){
      const map: Record<string,string> = {
        'invalid-email':'Введите корректный e-mail',
        'smtp-not-configured':'SMTP не настроен. Обратитесь к администратору.',
        'smtp-error':'Не удалось отправить письмо. Попробуйте позже.',
        'rate-limited': res.retryAfter
          ? `Код уже отправлен. Повторите через ${res.retryAfter} сек.`
          : 'Слишком частые запросы. Попробуйте чуть позже.',
      };
      const message = map[res.error||''] || 'Не удалось отправить код. Попробуйте позже.';
      setState(s => ({ ...s, isSending:false, error: message, info:'' }));
      return;
    }
    if (res.debugCode) {
      console.debug('[email] verification code (debug):', res.debugCode);
    }
    const expiryMessage = res.expiresAt
      ? ` Код действует до ${new Date(res.expiresAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.`
      : '';
    setState(s => ({
      ...s,
      isSending:false,
      sent:true,
      error:'',
      info:`Код отправлен. Проверьте почту.${expiryMessage}`,
      expiresAt: res.expiresAt ?? null,
      code:'',
    }));
  };

  const onVerify = async ()=>{
    const trimmedEmail = email.trim();
    if(!validateEmailFormat(trimmedEmail)){
      setError('Введите корректный e-mail');
      return;
    }
    const trimmedCode = code.trim();
    if(trimmedCode.length !== CODE_LENGTH){
      setError('Введите 6-значный код из письма');
      return;
    }
    setState(s => ({ ...s, isVerifying:true, error:'', info:'Проверяем код…' }));
    const res = await verifyCode(trimmedEmail, trimmedCode, { userId });
    if(!res.ok){
      const map: Record<string,string> = {
        'expired':'Срок действия кода истёк. Отправьте ещё раз.',
        'mismatch':'Неверный код. Проверьте и попробуйте снова.',
        'no-session':'Нет активной сессии подтверждения. Отправьте код заново.',
        'too-many-attempts':'Превышено число попыток. Запросите новый код.',
        'invalid-code':'Введите 6-значный код из письма.',
      };
      let message = map[res.error||''] || 'Не удалось подтвердить код.';
      if(res.error==='mismatch' && typeof res.attemptsLeft === 'number'){
        message += ` Осталось попыток: ${res.attemptsLeft}.`;
      }
      setState(s => ({ ...s, isVerifying:false, error: message, info:'' }));
      return;
    }
    const confirmedEmail = res.profile?.email || trimmedEmail;
    try {
      localStorage.setItem('userEmail', confirmedEmail);
      localStorage.setItem('userEmailVerified', '1');
    } catch {}
    setState(s => ({ ...s, isVerifying:false, error:'', info:'E-mail подтверждён!' }));
    router.push('/profile' as any);
  };

  const onResend = ()=>{ if(!isSending) onSend(); };

  return (
    <div className="vstack" style={{gap:16}}>
      <div className="topbar"><Link href="/profile">← Профиль</Link></div>

      <div className="card vstack" style={{gap:12}}>
        <label htmlFor="email"><b>E-mail</b></label>
        <input
          id="email" type="email" placeholder="you@example.com" value={email}
          onChange={e=>setState(s=>({
            ...s,
            email:e.target.value,
            error:'',
            info:'',
            sent:false,
            code:'',
            expiresAt:null,
          }))}
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
              setState(s=>({ ...s, email: `${local}@${suggestion}`, error:'', info:'', sent:false }));
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
          <button className="btn primary" onClick={onSend} disabled={isSending}>
            {isSending ? 'Отправка…' : 'Отправить код'}
          </button>
        ) : (
          <div className="vstack" style={{gap:8}}>
            <label htmlFor="code"><b>Код из письма</b></label>
            <input
              id="code" inputMode="numeric" pattern="[0-9]*" maxLength={CODE_LENGTH} placeholder="6 цифр"
              value={code}
              onChange={e=>{
                const digits = e.target.value.replace(/\D/g,'').slice(0, CODE_LENGTH);
                setState(s=>({ ...s, code:digits, error:'', info:'' }));
              }}
              style={{padding:'12px', border:'1px solid var(--border)', borderRadius:'12px',
                      letterSpacing:'6px', textAlign:'center', fontSize:18}}
            />
            {expiryLabel && (
              <div className="muted" style={{fontSize:12}}>Код действует до {expiryLabel}</div>
            )}
            <div className="hstack" style={{justifyContent:'space-between'}}>
              <button className="btn" onClick={onResend} disabled={isSending}>
                {isSending ? 'Отправка…' : 'Отправить ещё раз'}
              </button>
              <button className="btn primary" onClick={onVerify} disabled={isVerifying || code.length !== CODE_LENGTH}>
                {isVerifying ? 'Подтверждение…' : 'Подтвердить'}
              </button>
            </div>
          </div>
        )}

        {error && <div className="muted" style={{color:'var(--danger)'}}>{error}</div>}
        {info && !error && <div className="muted">{info}</div>}
      </div>
    </div>
  );
}
