'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const Ctx = createContext<{theme:Theme; setTheme:(t:Theme)=>void}>({theme:'light', setTheme:()=>{}});
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = (typeof window!=='undefined' && (localStorage.getItem('theme') as Theme)) || null;
    const sys = typeof window!=='undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const next = saved || sys || 'light';
    setTheme(next);
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.setAttribute('data-theme', next);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  return <Ctx.Provider value={{theme, setTheme}}>{children}</Ctx.Provider>;
}
export function useTheme(){ return useContext(Ctx); }
