'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Mode = 'light' | 'dark';
type Ctx = { mode: Mode; setMode: (m: Mode) => void; toggle: () => void; };

const C = createContext<Ctx | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' ? (localStorage.getItem('theme') as Mode) : null);
    const sys = (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    setMode(saved || sys);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('theme-dark'); else root.classList.remove('theme-dark');
    try { localStorage.setItem('theme', mode); window.dispatchEvent(new Event('pref:theme')); } catch {}
  }, [mode]);

  const api = useMemo<Ctx>(() => ({
    mode,
    setMode,
    toggle: () => setMode(m => (m === 'dark' ? 'light' : 'dark')),
  }), [mode]);

  return <C.Provider value={api}>{children}</C.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(C);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
