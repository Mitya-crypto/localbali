'use client';
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import { FLAGS, LANG_LABEL, translate, type Lang } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (l:Lang)=>void;
  t: (k:string)=>string;
  label: (l:Lang)=>string;
  flag: (l:Lang)=>string;
};
const I18nContext = createContext<Ctx | null>(null);

export default function I18nProvider({children}:{children:React.ReactNode}) {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    try { const s = localStorage.getItem('lang') as Lang | null; if (s) setLang(s); } catch {}
  }, []);
  const t = useCallback((k:string) => translate(lang, k), [lang]);
  const label = useCallback((l:Lang) => LANG_LABEL[l] ?? l, []);
  const flag = useCallback((l:Lang) => FLAGS[l] ?? '', []);
  const value = useMemo(()=>({lang, setLang, t, label, flag}),[lang, t, label, flag]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
