'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { FLAGS, LANG_LABEL, translate, type Lang } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  label: (lang: Lang) => string;
  flag: (lang: Lang) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved) setLangState(saved);
    } catch {
      // ignore localStorage access errors
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem('lang', next);
    } catch {
      // ignore persistence failures
    }
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);
  const label = useCallback((code: Lang) => LANG_LABEL[code], []);
  const flag = useCallback((code: Lang) => FLAGS[code], []);

  const value = useMemo(
    () => ({ lang, setLang, t, label, flag }),
    [flag, label, lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
