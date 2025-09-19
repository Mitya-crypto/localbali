// @ts-nocheck
'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'ru' | 'en' | 'id';

type I18nCtx = {
  lang: Lang;
  t: (key: string, vars?: Record<string, unknown>) => string;
  setLang: (l: Lang) => void; // ← гарантированно есть
};

// Дефолт: русский, заглушка t, setLang-нооп (чтобы не падало до маунта)
const Ctx = createContext<I18nCtx>({
  lang: 'ru',
  t: (key) => key,
  setLang: () => {},
});

export function I18nProvider({
  children,
  initialLang = 'ru',
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // берём язык из localStorage при маунте (если есть)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved) setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch {}
  };

  const t = (key: string) => key; // простая заглушка

  const value = useMemo(() => ({ lang, t, setLang }), [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
