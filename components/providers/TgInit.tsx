'use client';
import { useEffect } from 'react';

export default function TgInit() {
  useEffect(() => {
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg) {
        try { tg.ready(); } catch {}
        try { tg.expand(); } catch {}
        // Необязательно: оформление хедера/фона в мини-аппе
        try { tg.setHeaderColor('#0B1220'); } catch {}
        try { tg.setBackgroundColor('#0B1220'); } catch {}
      }
    } catch {}
  }, []);
  return null;
}
