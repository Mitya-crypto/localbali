// @ts-nocheck
'use client';
import React, {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';

declare global {
  interface Window { tronLink?: any; tronWeb?: any; Telegram?: any; }
}

type Item = { key: string; value: any; ok?: boolean; warn?: boolean; err?: boolean };
const kv = (key: string, value: any, flags: Partial<Item> = {}): Item => ({ key, value, ...flags });

export default function TronlinkScanPage() {
  const sp = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [addr, setAddr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deepLink, setDeepLink] = useState<string>('#');
  const [lastError, setLastError] = useState<string | null>(null);

  const isTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  const hasExt = typeof window !== 'undefined' && !!window.tronLink;
  const hasTronWeb = typeof window !== 'undefined' && !!window.tronWeb;

  useEffect(() => {
    setMounted(true);
    try {
      const url = window.location.origin + '/scan/tronlink';
      const payload = { url, action: 'open', protocol: 'tronlink', version: '1.0' };
      setDeepLink('tronlinkoutside://pull.activity?param=' + encodeURIComponent(JSON.stringify(payload)));
    } catch {}
  }, []);

  async function ensureConnected() {
    if (!window.tronLink) throw new Error('TronLink не найден. Откройте сайт в браузере с расширением или в приложении TronLink.');
    try {
      await window.tronLink.request?.({ method: 'tron_requestAccounts' });
    } catch (e:any) {
      // некоторые версии требуют повтор
      await window.tronLink.request?.({ method: 'tron_requestAccounts' }).catch(()=>{});
    }
    const a = window.tronWeb?.defaultAddress?.base58 || window.tronLink?.tronWeb?.defaultAddress?.base58 || null;
    if (!a) throw new Error('Кошелёк не дал адрес. Откройте DApp внутри TronLink (кнопка DeepLink) и повторите.');
    setAddr(a);
    return a;
  }

  async function signTest() {
    setBusy(true); setLastError(null);
    const out: Item[] = [];
    try {
      out.push(kv('env.telegramWebApp', String(isTelegram), { ok: !isTelegram, warn: isTelegram }));
      out.push(kv('env.hasTronLinkObject', String(hasExt), { ok: hasExt, err: !hasExt }));
      out.push(kv('env.hasTronWebObject', String(hasTronWeb), { ok: hasTronWeb, err: !hasTronWeb }));
      setItems(out);

      const address = await ensureConnected();
      out.push(kv('address', address, { ok: true }));

      const tw = window.tronWeb || window.tronLink?.tronWeb;
      const msg = 'CRYPTOBALI_TEST_' + Date.now();

      // 1) Путь TIP-191: signMessageV2 (предпочтительно)
      if (tw?.trx?.signMessageV2) {
        const sig = await tw.trx.signMessageV2(msg);
        out.push(kv('signMessageV2', sig ? 'ok' : 'fail', { ok: !!sig }));
        alert('signature (v2): ' + String(sig).slice(0, 32) + '...');
        setItems(out); setBusy(false); return;
      }

      if (window.tronLink?.request) {
        try {
          const sig2 = await window.tronLink.request({ method: 'tron_signMessage', params: { message: msg } });
          out.push(kv('tron_signMessage', sig2 ? 'ok' : 'fail', { ok: !!sig2, warn: !sig2 }));
          if (sig2) { alert('signature (provider): ' + String(sig2).slice(0,32) + '...'); setItems(out); setBusy(false); return; }
        } catch(e:any) {
          out.push(kv('tron_signMessage.error', e?.message || String(e), { warn: true }));
        }
      }

      try {
        const hex = tw.toHex(msg).replace(/^0x/, '');
        const bytes = tw.utils.code.hexStr2byteArray(hex);
        const hash = tw.sha3(bytes).replace(/^0x/, '');
        const sig3 = await tw.trx.sign(hash);
        out.push(kv('trx.sign(hash)', sig3 ? 'ok' : 'fail', { ok: !!sig3 }));
        alert('signature (fallback): ' + String(sig3).slice(0,32) + '...');
      } catch (e:any) {
        out.push(kv('trx.sign.fallback.error', e?.message || String(e), { err: true }));
        setLastError(e?.message || String(e));
      }

      setItems(out);
    } catch (e:any) {
      setLastError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function fullScan() {
    setBusy(true); setLastError(null);
    const out: Item[] = [];
    try {
      out.push(kv('env.telegramWebApp', String(isTelegram), { ok: !isTelegram, warn: isTelegram }));
      out.push(kv('env.hasTronLinkObject', String(hasExt), { ok: hasExt, err: !hasExt }));
      out.push(kv('env.hasTronWebObject', String(hasTronWeb), { ok: hasTronWeb, err: !hasTronWeb }));
      if (hasExt && window.tronLink.ready === false) out.push(kv('tronLink.ready', String(window.tronLink.ready), { warn: true }));

      if (hasExt) {
        try {
          const res = await window.tronLink.request?.({ method: 'tron_requestAccounts' });
          out.push(kv('tron_requestAccounts', JSON.stringify(res), { ok: true }));
        } catch (e:any) { out.push(kv('tron_requestAccounts.error', e?.message || String(e), { err: true })); }
      }

      const tw = window.tronWeb || window.tronLink?.tronWeb;
      if (tw) {
        try {
          const a = tw.defaultAddress?.base58 || null; setAddr(a || null);
          out.push(kv('tronWeb.defaultAddress.base58', a, { ok: !!a, err: !a }));
        } catch (e:any) { out.push(kv('defaultAddress.error', e?.message || String(e), { err: true })); }

        try {
          const node = await tw.trx.getNodeInfo();
          const host = tw.fullNode?.host || tw.currentProvider?.host || '';
          out.push(kv('node.host', host || '-', { ok: !!host }));
          out.push(kv('node.p2pVersion', String(node?.configNodeInfo?.p2pVersion ?? '-'), { ok: true }));
        } catch (e:any) { out.push(kv('trx.getNodeInfo.error', e?.message || String(e), { warn: true })); }
      }

      if (isTelegram && !hasExt) {
        out.push(kv('hint', 'Вы в Telegram WebView — расширения не работают. Откройте сайт через TronLink (кнопка ниже) или в системном браузере.', { warn: true }));
      }
      setItems(out);
    } finally { setBusy(false); }
  }

  useEffect(() => { fullScan(); }, []);
  useEffect(() => { if (mounted && sp?.get('autorun') === '1') { signTest(); } }, [mounted, sp]);

  const badge = (x?: Item) => x?.err ? 'bg-red-500' : x?.warn ? 'bg-yellow-500' : x?.ok ? 'bg-green-600' : 'bg-gray-600';

  const disabledSign = !hasTronWeb || isTelegram && !hasExt; // блокируем тест там, где он заведомо не сработает

  return (
    <div className="min-h-screen p-5 md:p-10 text-sm text-white" style={{background:'#0b0f14'}}>
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">TRON • TronLink Scanner</h1>

        <div className="flex gap-2 flex-wrap">
          <button onClick={fullScan} disabled={busy} className="px-3 py-2 rounded-lg bg-blue-600 disabled:opacity-50">Повторить скан</button>
          <button onClick={signTest} disabled={busy || disabledSign} className="px-3 py-2 rounded-lg bg-purple-600 disabled:opacity-50">Запустить тест подписи</button>
          {mounted && (
            <a href={deepLink} className="px-3 py-2 rounded-lg bg-orange-600">Открыть в TronLink (DeepLink)</a>
          )}
        </div>
        {lastError && <div className="p-3 rounded-lg bg-red-900/40 border border-red-800">Ошибка: {lastError}</div>}

        <div className="rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-3 bg-gray-900 border-b border-gray-800">Результаты</div>
          <div className="divide-y divide-gray-800">
            {items.map((it, idx) => (
              <div key={idx} className="p-3 flex items-start gap-2">
                <span className={'inline-block w-2 h-2 mt-2 rounded-full ' + badge(it)} />
                <div className="w-48 text-gray-400">{it.key}</div>
                <div className="flex-1 break-words">{String(it.value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-gray-400">Адрес: <span className="text-white">{addr || '—'}</span></div>
        <div className="text-gray-500 text-xs">Подсказка: можно открыть страницу с авто-запуском — <code>?autorun=1</code></div>
      </div>
    </div>
  );
}
