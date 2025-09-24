'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

const SKIP_PREFIXES = ['/verify', '/pin', '/scan'];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'exit', '0', 'back'] as const;
type KeyType = (typeof KEYS)[number];

export default function PinGuard() {
  const pathname = usePathname() || '';
  const [needPin, setNeedPin] = React.useState(false);
  const [pinValue, setPinValue] = React.useState('');
  const [pinLength, setPinLength] = React.useState(4);
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState('');
  const [shake, setShake] = React.useState(false);
  const [faceEnabled, setFaceEnabled] = React.useState(false);
  const [faceAvailable, setFaceAvailable] = React.useState(false);
  const [faceAttempted, setFaceAttempted] = React.useState(false);
  const [faceLoading, setFaceLoading] = React.useState(false);
  const shouldSkip = React.useMemo(() => SKIP_PREFIXES.some(prefix => pathname.startsWith(prefix)), [pathname]);

  const evaluateNeedPin = React.useCallback(() => {
    try {
      const enabled = localStorage.getItem('pin_enabled') === '1';
      const storedPin = localStorage.getItem('pin_code') || '';
      const ok = localStorage.getItem('pin_ok') === '1';
      const face = localStorage.getItem('faceid_enabled') === '1';
      setPinValue(storedPin);
      setPinLength(storedPin.length > 0 ? Math.max(storedPin.length, 4) : 4);
      setFaceEnabled(face);
      const required = Boolean(enabled && storedPin && !ok);
      setNeedPin(required);
      if (!required) {
        setCode('');
        setErr('');
        setShake(false);
        setFaceAttempted(false);
        setFaceLoading(false);
      }
    } catch {
      setNeedPin(false);
    }
  }, []);

  React.useEffect(() => {
    evaluateNeedPin();
  }, [evaluateNeedPin, pathname]);

  React.useEffect(() => {
    const onStorage = () => evaluateNeedPin();
    const onFocus = () => evaluateNeedPin();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') evaluateNeedPin();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [evaluateNeedPin]);

  React.useEffect(() => {
    let active = true;
    const checkFace = async () => {
      if (!needPin || !faceEnabled) {
        if (active) setFaceAvailable(false);
        return;
      }
      const manager = (window as any)?.Telegram?.WebApp?.BiometricsManager;
      if (!manager) {
        if (active) setFaceAvailable(false);
        return;
      }
      try {
        const availableRes = await manager.isBiometricsAvailable?.();
        if (!availableRes?.available) {
          if (active) setFaceAvailable(false);
          return;
        }
        const enrolledRes = await manager.isBiometricsEnrolled?.();
        if (!active) return;
        const allowed = enrolledRes ? Boolean(enrolledRes.enrolled || enrolledRes.canEnroll) : true;
        setFaceAvailable(allowed);
      } catch {
        if (active) setFaceAvailable(false);
      }
    };
    checkFace();
    return () => {
      active = false;
    };
  }, [needPin, faceEnabled]);

  const shakeTimer = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, []);

  const prevNeedPin = React.useRef(false);
  React.useEffect(() => {
    if (needPin && !prevNeedPin.current) {
      setCode('');
      setErr('');
      setShake(false);
      setFaceAttempted(false);
      setFaceLoading(false);
    }
    prevNeedPin.current = needPin;
  }, [needPin]);

  const checkPin = React.useCallback((value: string) => {
    try {
      const pin = pinValue;
      if (!pin) {
        setNeedPin(false);
        return;
      }
      if (value === pin) {
        localStorage.setItem('pin_ok', '1');
        setErr('');
        setNeedPin(false);
        setCode('');
        setFaceAttempted(false);
      } else {
        setErr('Неверный PIN-код');
        setCode('');
        setShake(true);
        if (shakeTimer.current) clearTimeout(shakeTimer.current);
        shakeTimer.current = setTimeout(() => setShake(false), 420);
      }
    } catch {
      setNeedPin(false);
    }
  }, [pinValue]);

  React.useEffect(() => {
    if (!needPin) return;
    if (!pinValue) return;
    if (code.length === pinValue.length && pinValue.length > 0) {
      checkPin(code);
    }
  }, [code, needPin, pinValue, checkPin]);

  const handleDigit = React.useCallback((digit: string) => {
    setCode(prev => {
      if (prev.length >= pinLength) return prev;
      return prev + digit;
    });
    if (err) setErr('');
  }, [pinLength, err]);

  const handleBackspace = React.useCallback(() => {
    setCode(prev => prev.slice(0, -1));
    if (err) setErr('');
  }, [err]);

  const handleExit = React.useCallback(() => {
    try {
      localStorage.removeItem('pin_ok');
    } catch {}
    window.location.href = '/profile';
  }, []);

  const handleClose = React.useCallback(() => {
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.close) {
        tg.close();
        return;
      }
    } catch {}
    try { window.history.back(); } catch {}
  }, []);

  const tryFaceId = React.useCallback(async () => {
    const manager = (window as any)?.Telegram?.WebApp?.BiometricsManager;
    if (!manager) {
      setErr('Face ID недоступен');
      setFaceAttempted(true);
      return;
    }
    try {
      setFaceLoading(true);
      setErr('');
      const res = await manager.authenticate?.({ reason: 'Подтвердите личность' });
      if (res?.success) {
        localStorage.setItem('pin_ok', '1');
        setNeedPin(false);
        setCode('');
        setFaceAttempted(false);
        return;
      }
      setErr('Не удалось подтвердить Face ID');
    } catch {
      setErr('Не удалось подтвердить Face ID');
    } finally {
      setFaceLoading(false);
      setFaceAttempted(true);
    }
  }, []);

  React.useEffect(() => {
    if (needPin && faceEnabled && faceAvailable && !faceAttempted) {
      tryFaceId();
    }
  }, [needPin, faceEnabled, faceAvailable, faceAttempted, tryFaceId]);

  React.useEffect(() => {
    if (!needPin) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        handleDigit(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleBackspace();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      } else if (event.key === 'Enter') {
        if (pinValue && code.length === pinValue.length) {
          event.preventDefault();
          checkPin(code);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [needPin, handleDigit, handleBackspace, handleClose, checkPin, pinValue, code]);

  const onKeyPress = React.useCallback((key: KeyType) => {
    if (key === 'exit') {
      handleExit();
      return;
    }
    if (key === 'back') {
      handleBackspace();
      return;
    }
    handleDigit(key);
  }, [handleExit, handleBackspace, handleDigit]);

  if (!needPin || shouldSkip) return null;

  return (
    <div className="pin-guard">
      <div className="pin-guard__wrap" role="dialog" aria-modal="true" aria-label="PIN защита">
        <header className="pin-guard__head">
          <button type="button" className="pin-guard__close" onClick={handleClose}>
            Закрыть
          </button>
          <div className="pin-guard__app">
            <div className="pin-guard__appTitle">Antarctic Wallet</div>
            <div className="pin-guard__appSubtitle">мини-приложение</div>
          </div>
          <div className="pin-guard__stub" aria-hidden="true" />
        </header>

        <div className="pin-guard__body">
          <div className={`pin-guard__content${shake ? ' is-shake' : ''}`}>
            <h1 className="pin-guard__title">Введите PIN-код</h1>
            <div className="pin-guard__dots" aria-hidden="true">
              {Array.from({ length: pinLength }, (_, idx) => (
                <span key={idx} className={`pin-guard__dot${idx < code.length ? ' on' : ''}`} />
              ))}
            </div>
            <div className="pin-guard__error" aria-live="polite">
              {err || '\u00A0'}
            </div>
            {faceEnabled && faceAvailable && (
              <button
                type="button"
                className="pin-guard__face"
                onClick={tryFaceId}
                disabled={faceLoading}
              >
                <FaceIcon />
                <span>{faceLoading ? 'Ожидание…' : 'Войти с Face ID'}</span>
              </button>
            )}
          </div>

          <div className="pin-guard__keypad">
            {KEYS.map(key => (
              <button
                key={key}
                type="button"
                className="pin-guard__key"
                data-variant={key === 'exit' ? 'exit' : key === 'back' ? 'back' : undefined}
                onClick={() => onKeyPress(key)}
                aria-label={key === 'exit' ? 'Выйти' : key === 'back' ? 'Удалить' : `Цифра ${key}`}
              >
                {key === 'exit' ? 'Выйти' : key === 'back' ? '×' : key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V5a2 2 0 0 1 2-2h2" />
      <path d="M20 7V5a2 2 0 0 0-2-2h-2" />
      <path d="M4 17v2a2 2 0 0 0 2 2h2" />
      <path d="M20 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M9 10.5c.5-.5 1.1-.8 2-.8s1.5.3 2 .8" />
      <path d="M13 10.5c.5-.5 1.1-.8 2-.8s1.5.3 2 .8" />
      <path d="M9 15c.7.7 1.5 1 3 1s2.3-.3 3-1" />
    </svg>
  );
}
