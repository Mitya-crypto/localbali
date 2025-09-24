'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  validateEmailFormat,
  suggestDomainFor,
  isDisposableDomain,
  startVerification,
  verifyCode,
  getEmail,
  splitEmail,
  subscribeEmailStatus,
  fetchEmailStatus,
} from '../../lib/email-util';

type ViewState = {
  email: string;
  sent: boolean;
  error: string;
  info: string;
  code: string;
  loading: boolean;
  verifying: boolean;
  verified: boolean;
};

export default function EmailPage() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({
    email: '',
    sent: false,
    error: '',
    info: '',
    code: '',
    loading: false,
    verifying: false,
    verified: false,
  });

  useEffect(() => {
    const initial = getEmail();
    setState((s) => ({
      ...s,
      email: initial.email || s.email,
      sent: initial.pending,
      verified: initial.verified,
    }));
    fetchEmailStatus().catch(() => {});
    const unsubscribe = subscribeEmailStatus((next) => {
      setState((s) => ({
        ...s,
        email: next.email || s.email,
        sent: next.pending,
        verified: next.verified,
      }));
      if (next.verified) {
        router.push('/profile' as any);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const { email, sent, error, info, code, loading, verifying, verified } = state;

  const suggestion = useMemo(() => (email ? suggestDomainFor(email) : null), [email]);
  const disposable = useMemo(() => {
    const { domain } = splitEmail(email || '');
    return domain ? isDisposableDomain(domain) : false;
  }, [email]);

  const onSend = async () => {
    const value = email.trim();
    if (!validateEmailFormat(value)) {
      setState((s) => ({ ...s, error: 'Введите корректный e-mail', info: '' }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: '', info: '' }));
    const res = await startVerification(value);
    if (!res.ok) {
      const map: Record<string, string> = {
        'invalid-email': 'Введите корректный e-mail',
        'missing-email': 'Укажите e-mail',
      };
      setState((s) => ({
        ...s,
        loading: false,
        sent: res.status?.pending ?? s.sent,
        error: map[res.error] || res.message || 'Не удалось отправить код',
      }));
      return;
    }
    const message =
      res.message ||
      (res.delivered
        ? 'Код отправлен на указанный e-mail.'
        : 'SMTP не настроен. Код записан в лог сервера.');
    setState((s) => ({
      ...s,
      loading: false,
      sent: res.status.pending,
      info: message,
      error: '',
      code: '',
    }));
  };

  const onVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setState((s) => ({ ...s, error: 'Введите код подтверждения.' }));
      return;
    }
    setState((s) => ({ ...s, verifying: true, error: '' }));
    const res = await verifyCode(trimmed);
    if (!res.ok) {
      const map: Record<string, string> = {
        expired: 'Срок действия кода истёк. Отправьте ещё раз.',
        mismatch: 'Неверный код. Проверьте и попробуйте снова.',
        'no-session': 'Нет активной сессии подтверждения. Отправьте код заново.',
        'missing-code': 'Введите код подтверждения.',
      };
      setState((s) => ({
        ...s,
        verifying: false,
        error: map[res.error] || res.message || 'Не удалось подтвердить код',
      }));
      return;
    }
    setState((s) => ({ ...s, verifying: false, info: 'E-mail подтверждён ✅', error: '' }));
    router.push('/profile' as any);
  };

  const onResend = () => {
    if (!loading) onSend();
  };

  return (
    <div className="vstack" style={{ gap: 16 }}>
      <div className="topbar">
        <Link href="/profile">← Профиль</Link>
      </div>

      <div className="card vstack" style={{ gap: 12 }}>
        <label htmlFor="email">
          <b>E-mail</b>
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) =>
            setState((s) => ({ ...s, email: e.target.value, error: '', info: '' }))
          }
          style={{
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: 'var(--card)',
            color: 'var(--text)',
          }}
        />

        {suggestion && (
          <div className="li" style={{ marginTop: 4 }}>
            <div className="left">
              <div className="li circle">💡</div>
              <div>
                <b>Похоже, опечатка</b>
                <div className="muted" style={{ fontSize: 12 }}>
                  Возможно, вы имели в виду <code>{email.split('@')[0]}@{suggestion}</code>
                </div>
              </div>
            </div>
            <button
              className="btn"
              onClick={() => {
                const local = email.split('@')[0] || '';
                setState((s) => ({ ...s, email: `${local}@${suggestion}` }));
              }}
            >
              Исправить
            </button>
          </div>
        )}

        {disposable && (
          <div className="li" style={{ marginTop: 4, borderColor: 'var(--warning)' }}>
            <div className="left">
              <div className="li circle">⚠️</div>
              <div>
                <b>Одноразовый домен</b>
                <div className="muted" style={{ fontSize: 12 }}>
                  Такие адреса часто недоступны для восстановления доступа.
                </div>
              </div>
            </div>
          </div>
        )}

        {!sent ? (
          <button className="btn primary" onClick={onSend} disabled={loading}>
            {loading ? 'Отправляем…' : 'Отправить код'}
          </button>
        ) : (
          <div className="vstack" style={{ gap: 8 }}>
            <label htmlFor="code">
              <b>Код из письма</b>
            </label>
            <input
              id="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="6 цифр"
              value={code}
              onChange={(e) =>
                setState((s) => ({ ...s, code: e.target.value.replace(/\D/g, '') }))
              }
              style={{
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                letterSpacing: '6px',
                textAlign: 'center',
                fontSize: 18,
              }}
            />
            <div className="hstack" style={{ justifyContent: 'space-between' }}>
              <button className="btn" onClick={onResend} disabled={loading}>
                {loading ? 'Отправляем…' : 'Отправить ещё раз'}
              </button>
              <button className="btn primary" onClick={onVerify} disabled={verifying}>
                {verifying ? 'Проверяем…' : 'Подтвердить'}
              </button>
            </div>
          </div>
        )}

        {error && <div className="muted" style={{ color: 'var(--danger)' }}>{error}</div>}
        {info && !error && <div className="muted">{info}</div>}
      </div>

      {verified && (
        <div className="card muted" style={{ fontSize: 12 }}>
          Ваш e-mail подтверждён. Письма будут приходить на <b>{email}</b>.
        </div>
      )}
    </div>
  );
}
