'use client';
import React from 'react';
import { useI18n } from '../../../lib/i18n';

const LANGS: { code:'ru'|'en'|'id'; label:string }[] = [
  { code:'ru', label:'Русский' },
  { code:'en', label:'English' },
  { code:'id', label:'Bahasa Indonesia' },
];

export default function LanguagePage() {
  const { lang, setLang, t } = useI18n();
  return (
    <main className="mx-auto max-w-[480px] p-4">
      <h1 className="text-xl font-semibold mb-4">{t('settings.language.title')}</h1>
      <div className="space-y-2">
        {LANGS.map(L => (
          <button
            key={L.code}
            onClick={() => setLang(L.code)}
            className={`w-full flex items-center justify-between rounded-2xl p-4 shadow ${lang===L.code?'border-2':'border'} border-gray-300`}
          >
            <span>{L.label}</span>
            {lang===L.code && <span aria-hidden>✓</span>}
          </button>
        ))}
      </div>
    </main>
  );
}
