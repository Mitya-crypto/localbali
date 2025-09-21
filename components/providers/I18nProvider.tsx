'use client';
import {createContext, useContext, useEffect, useMemo, useState, useCallback} from 'react';

export type Lang = 'ru'|'en'|'id'|'es'|'de';

type Ctx = {
  lang: Lang;
  setLang: (l:Lang)=>void;
  t: (k:string)=>string;
};
const I18nContext = createContext<Ctx | null>(null);

const DICT: Record<Lang, Record<string,string>> = {
  en: { 'profile.title':'Profile' },
  ru: { 'profile.title':'Профиль' },
  id: {}, es: {}, de: {}
};

export default function I18nProvider({children}:{children:React.ReactNode}) {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    try { const s = localStorage.getItem('lang') as Lang | null; if (s) setLang(s); } catch {}
  }, []);
  const t = useCallback((k:string) => (DICT[lang]?.[k] ?? k), [lang]);
  const value = useMemo(()=>({lang, setLang, t}),[lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
