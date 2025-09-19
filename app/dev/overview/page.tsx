'use client';
import { useEffect, useRef, useState } from 'react';

type Arch = { routes: string[]; apis: string[]; tree: string; mermaid: string; };

export default function DevOverview() {
  const [data, setData] = useState<Arch | null>(null);
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<Record<string, string>>({});
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/dev/arch').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const run = async () => {
      if (typeof window === 'undefined') return;
      const w = window as any;
      if (w.mermaid) { renderMermaid(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      s.async = true;
      s.onload = () => { if (!cancelled) renderMermaid(); };
      document.head.appendChild(s);
    };
    run();
    return () => { cancelled = true; };
  }, [data]);

  function renderMermaid() {
    const w = window as any;
    if (!w.mermaid || !mermaidRef.current || !data) return;
    mermaidRef.current.innerHTML = '';
    const pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = data.mermaid.replace(/^```mermaid\s*|\s*```$/g, '');
    mermaidRef.current.appendChild(pre);
    w.mermaid.initialize({ startOnLoad: false, theme: 'default' });
    w.mermaid.init(undefined, mermaidRef.current);
  }

  async function callApi(url: string, method: 'GET' | 'POST') {
    try {
      setBusy(true);
      const r = await fetch(url, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify({ ping: 'ok' }) : undefined,
      });
      const text = await r.text();
      setResp(s => ({ ...s, [url]: `HTTP ${r.status} ${r.statusText}\n${text}` }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0 }}>Dev Overview</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
        <h3>Mermaid</h3>
        <div ref={mermaidRef} />
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
        <h3>Pages</h3>
        {!data ? (
          <div>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.routes.map(r => (
              <a key={r} href={r} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8, textDecoration: 'none', color: '#111' }}>
                {r}
              </a>
            ))}
          </div>
        )}
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
        <h3>APIs</h3>
        {!data ? (
          <div>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.apis.map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ flex: 1 }}>{a}</code>
                <button disabled={busy} onClick={() => callApi(a, 'GET')} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '4px 8px' }}>GET</button>
                <button disabled={busy} onClick={() => callApi(a, 'POST')} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '4px 8px' }}>POST</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          {Object.entries(resp).map(([k, v]) => (
            <details key={k} open style={{ marginBottom: 8 }}>
              <summary><code>{k}</code></summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{v}</pre>
            </details>
          ))}
        </div>
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
        <h3>File tree</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{data?.tree || 'Loading…'}</pre>
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a href="/verify" style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8 }}>→ /verify</a>
        <a href="/pin" style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8 }}>→ /pin</a>
        <a href="/home" style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8 }}>→ /home</a>
        <button onClick={() => { localStorage.removeItem('pinHash'); sessionStorage.clear(); alert('PIN/session cleared'); }} style={{ padding: '6px 10px', border: '1px solid #fca5a5', borderRadius: 8, background: '#fff0f0' }}>Clear PIN/session</button>
      </section>
    </div>
  );
}
