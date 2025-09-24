'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSignMessage } from 'wagmi';
import {
  getCurrentUserKey, listWalletsFor, addEvmWallet,
  addManualWallet, addTronWallet, removeWallet, type WalletRecord
} from '../../lib/wallets';
import { fetchEmailStatus, getEmail, subscribeEmailStatus } from '../../lib/email-util';
import {
  isTronInjected, ensureTronInjected, connectTronLink,
  getUsdtBalance, shortTron, onTronAccountChanged
} from '../../lib/tron';

function short(addr:string){ return addr.length>12 ? addr.slice(0,6)+'…'+addr.slice(-4) : addr; }
const btcRe = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,}$/i;
const tonRe = /^([A-Za-z0-9_\-+:]{48,}|0:[A-Fa-fA-F0-9]{64})$/;
const evmRe = /^0x[a-fA-F0-9]{40}$/;
const tronRe = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const hasWC = !!process.env.NEXT_PUBLIC_WC_PROJECT_ID;

export default function WalletsPage(){
  const [{ email, verified }, setMail] = useState<{email?:string; verified:boolean}>({verified:false});
  const userKey = useMemo(()=> (verified && email ? email.toLowerCase() : null), [email, verified]);

  // EVM (wagmi)
  const { address, connector, isConnected, status: accStatus } = useAccount();
  const { connectors, connectAsync, status: connectStatus, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  // UI state
  const [list, setList] = useState<WalletRecord[]>([]);
  const [btc, setBtc] = useState(''); const [ton, setTon] = useState(''); const [evm, setEvm] = useState('');
  const [err, setErr] = useState(''); const [okMsg, setOkMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Tron
  const [tronAvailable, setTronAvailable] = useState<'unknown'|'yes'|'no'>('unknown');
  const [tronAddr, setTronAddr] = useState<string>('');
  const [tronManual, setTronManual] = useState<string>(''); // ввод T-адреса вручную
  const [tronUsdt, setTronUsdt] = useState<number|null>(null);
  const [tronBusy, setTronBusy] = useState(false);
  const [tronApiBusy, setTronApiBusy] = useState(false);

  useEffect(()=>{
    const status = getEmail();
    setMail({ email: status.email, verified: status.verified });
    fetchEmailStatus().catch(()=>{});
    const off = subscribeEmailStatus((next)=>{
      setMail({ email: next.email, verified: next.verified });
    });
    return ()=>off();
  },[]);
  useEffect(()=>{ if(userKey) setList(listWalletsFor(userKey)); },[userKey]);

  useEffect(()=>{
    if (typeof window === 'undefined') return;
    setTronAvailable(isTronInjected() ? 'yes' : 'no');
    const off = onTronAccountChanged((a)=>{
      setTronAddr(a || '');
      if (a && userKey) setList(addTronWallet(userKey, a, 'TronLink'));
      if (a){
        getUsdtBalance(a).then(v=>setTronUsdt(v)).catch(()=>setTronUsdt(null));
      } else {
        setTronUsdt(null);
      }
    });
    return ()=> off();
  },[userKey]);

  // ——— EVM flows ———
  const saveEvm = async ()=>{
    if(!userKey) throw new Error('Нужно подтвердить e-mail.');
    if(!address || !connector) throw new Error('Кошелёк не подключён.');
    const msg = `Link wallet to ${userKey} at ${new Date().toISOString()}`;
    await signMessageAsync({ message: msg });
    const updated = addEvmWallet(userKey, address, chainId, connector.name);
    setList(updated); setOkMsg('EVM-адрес сохранён ✅');
  };

  const connectViaInjected = async ()=>{
    setErr(''); setOkMsg(''); setBusy(true);
    try{
      if(!userKey) throw new Error('Нужно подтвердить e-mail.');
      const inj = connectors.find(c =>
        (c.type==='injected' || c.id==='injected' || /MetaMask|Rabby|OKX|Bitget|Brave/i.test(c.name)) && (c as any)?.ready
      ) || connectors[0];
      if(!inj || !(inj as any)?.ready) throw new Error('Не найден установленный EVM-кошелёк (MetaMask/Brave/Rabby/OKX).');
      await connectAsync({ connector: inj });
      await saveEvm();
    }catch(e:any){ setErr(e?.message || connectError?.message || 'Не удалось подключить через расширение.'); }
    finally{ setBusy(false); }
  };

  const connectViaWalletConnect = async ()=>{
    setErr(''); setOkMsg(''); setBusy(true);
    try{
      if(!userKey) throw new Error('Нужно подтвердить e-mail.');
      const wc = connectors.find(c => c.id==='walletConnect' || /WalletConnect/i.test(c.name));
      if(!wc) throw new Error('WalletConnect не настроен (NEXT_PUBLIC_WC_PROJECT_ID).');
      await connectAsync({ connector: wc });
      await saveEvm();
    }catch(e:any){ setErr(e?.message || connectError?.message || 'Не удалось подключить через WalletConnect.'); }
    finally{ setBusy(false); }
  };

  // ——— BTC/TON/EVM manual ———
  const addBtc = ()=>{
    setErr(''); setOkMsg('');
    if(!userKey){ setErr('Нужно подтвердить e-mail.'); return; }
    const a = btc.trim(); if(!btcRe.test(a)){ setErr('Некорректный BTC адрес'); return; }
    setList(addManualWallet(userKey, 'btc', a, 'BTC')); setBtc(''); setOkMsg('BTC адрес добавлен ✅');
  };
  const addTon = ()=>{
    setErr(''); setOkMsg('');
    if(!userKey){ setErr('Нужно подтвердить e-mail.'); return; }
    const a = ton.trim(); if(!tonRe.test(a)){ setErr('Некорректный TON адрес'); return; }
    setList(addManualWallet(userKey, 'ton', a, 'TON')); setTon(''); setOkMsg('TON адрес добавлен ✅');
  };
  const addEvmManual = ()=>{
    setErr(''); setOkMsg('');
    if(!userKey){ setErr('Нужно подтвердить e-mail.'); return; }
    const a = evm.trim(); if(!evmRe.test(a)){ setErr('Некорректный EVM адрес (0x...)'); return; }
    setList(addManualWallet(userKey, 'evm', a, 'EVM')); setEvm(''); setOkMsg('EVM адрес добавлен вручную ✅');
  };

  // ——— TronLink ———
  const connectTron = async ()=>{
    setErr(''); setOkMsg(''); setTronBusy(true);
    try{
      if(!userKey) throw new Error('Нужно подтвердить e-mail.');
      try { await ensureTronInjected(); setTronAvailable('yes'); }
      catch { setTronAvailable('no'); throw new Error('TronLink не найден. Установите расширение и перезагрузите страницу.'); }
      const { address } = await connectTronLink(); // T...
      setTronAddr(address);
      setList(addTronWallet(userKey, address, 'TronLink'));
      try{ setTronUsdt(null); const bal = await getUsdtBalance(address); setTronUsdt(bal); }catch{ setTronUsdt(null); }
      setOkMsg('TRON адрес сохранён ✅');
    }catch(e:any){ setErr(e?.message || 'Не удалось подключить TronLink.'); }
    finally{ setTronBusy(false); }
  };

  // ——— TRON manual + API fallback ———
  const addTronManual = ()=>{
    setErr(''); setOkMsg('');
    if(!userKey){ setErr('Нужно подтвердить e-mail.'); return; }
    const a = tronManual.trim(); if(!tronRe.test(a)){ setErr('Некорректный TRON адрес (ожидаем T...)'); return; }
    setList(addManualWallet(userKey, 'tron', a, 'TRON'));
    setTronAddr(a);
    setTronManual('');
    setOkMsg('TRON адрес добавлен вручную ✅');
  };

  const tronSaved = useMemo(()=> list.find(w=>w.kind==='tron')?.address, [list]);
  const refreshTronUsdtViaApi = async ()=>{
    const a = tronAddr || tronSaved;
    if(!a){ setErr('Нет TRON адреса. Введите вручную или подключите TronLink.'); return; }
    setTronApiBusy(true); setErr(''); setOkMsg('');
    try{
      const r = await fetch(`/api/tron/usdt?address=${a}`);
      const j = await r.json();
      if(!r.ok) throw new Error(j?.error || 'API error');
      setTronUsdt(Number(j.usdt||0));
      setOkMsg('Баланс USDT обновлён (API) ✅');
    }catch(e:any){
      setErr(e?.message || 'Не удалось получить баланс через API.');
    }finally{
      setTronApiBusy(false);
    }
  };

  const del = (id:string)=>{ if(!userKey) return; setOkMsg(''); setErr(''); setList(removeWallet(userKey,id)); };

  if(!verified){
    return (
      <div className="vstack" style={{gap:16}}>
        <div className="topbar"><a href="/profile">← Профиль</a></div>
        <div className="card">
          <b>Привязка кошельков доступна после подтверждения e-mail.</b>
          <div className="hstack" style={{marginTop:12, gap:12}}>
            <a href="/email" className="btn primary">Подтвердить e-mail</a>
            <a href="/profile" className="btn">Вернуться</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vstack" style={{gap:16}}>
      <div className="topbar"><a href="/profile">← Профиль</a></div>

      <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <b>Кошельки</b>
        <span className="muted" style={{fontSize:12}}>{email}</span>
      </div>

      {/* TRON / TronLink + API фолбэк */}
      <div className="card vstack" style={{gap:12}}>
        <b>TRON (USDT TRC20)</b>

        <div className="hstack" style={{gap:12, flexWrap:'wrap'}}>
          <button className="btn primary" onClick={connectTron} disabled={tronBusy}>
            {tronBusy ? 'Подключаем TronLink…' : 'Подключить TronLink'}
          </button>
          <button className="btn" onClick={refreshTronUsdtViaApi} disabled={tronApiBusy}>
            {tronApiBusy ? 'Обновляем…' : 'Баланс через API'}
          </button>
        </div>

        {tronAvailable==='no' && (
          <div className="muted" style={{fontSize:12}}>
            TronLink не найден. Можно <b>ввести T-адрес вручную</b> и получить баланс через TronScan API.
          </div>
        )}

        {/* Ручной ввод TRON */}
        <div className="grid2">
          <div className="vstack" style={{gap:8}}>
            <label><b>TRON адрес</b></label>
            <input value={tronManual} onChange={e=>setTronManual(e.target.value)} placeholder="T..." style={{padding:'10px',border:'1px solid var(--border)',borderRadius:'12px'}}/>
            <button className="btn" onClick={addTronManual}>Добавить TRON вручную</button>
          </div>
        </div>

        {(tronAddr || tronSaved) && (
          <div className="li">
            <div className="left">
              <div className="li circle">🟣</div>
              <div>
                <b>TRON</b>
                <div className="muted" style={{fontSize:12}}>{shortTron(tronAddr || tronSaved!)}</div>
              </div>
            </div>
            <div>
              <b>{tronUsdt!=null ? `${tronUsdt.toLocaleString('ru-RU',{maximumFractionDigits:2})} USDT` : '—'}</b>
            </div>
          </div>
        )}
      </div>

      {/* EVM: расширение и WalletConnect */}
      <div className="card vstack" style={{gap:12}}>
        <b>EVM через расширение</b>
        <button className="btn" onClick={connectViaInjected} disabled={busy || accStatus==='connecting' || connectStatus==='pending'}>
          {busy || connectStatus==='pending' ? 'Подключаем…' : 'Подключить (MetaMask/Rabby/OKX)'}
        </button>
        {isConnected && address && (
          <div className="li">
            <div className="left">
              <div className="li circle">⛓️</div>
              <div><b>{connector?.name || 'Wallet'}</b><div className="muted" style={{fontSize:12}}>{short(address)} • chainId {chainId}</div></div>
            </div>
            <button className="btn" onClick={()=>disconnect()}>Отключить</button>
          </div>
        )}
      </div>
      <div className="card vstack" style={{gap:12}}>
        <b>EVM через WalletConnect</b>
        <button className="btn" onClick={connectViaWalletConnect} disabled={busy || accStatus==='connecting' || connectStatus==='pending' || !hasWC}>
          {hasWC ? (busy ? 'Подключаем…' : 'Подключить (QR/мобильный)') : 'WalletConnect не настроен'}
        </button>
        {!hasWC && <div className="muted" style={{fontSize:12}}>Укажите <code>NEXT_PUBLIC_WC_PROJECT_ID</code> в <code>.env.local</code>.</div>}
      </div>

      {/* Ручные адреса */}
      <div className="card vstack" style={{gap:12}}>
        <b>Добавить вручную</b>
        <div className="grid2">
          <div className="vstack" style={{gap:8}}>
            <label><b>BTC адрес</b></label>
            <input value={btc} onChange={e=>setBtc(e.target.value)} placeholder="bc1..." style={{padding:'10px',border:'1px solid var(--border)',borderRadius:'12px'}}/>
            <button className="btn" onClick={addBtc}>Добавить BTC</button>
          </div>
          <div className="vstack" style={{gap:8}}>
            <label><b>TON адрес</b></label>
            <input value={ton} onChange={e=>setTon(e.target.value)} placeholder="EQ... / 0:..." style={{padding:'10px',border:'1px solid var(--border)',borderRadius:'12px'}}/>
            <button className="btn" onClick={addTon}>Добавить TON</button>
          </div>
          <div className="vstack" style={{gap:8}}>
            <label><b>EVM адрес</b></label>
            <input value={evm} onChange={e=>setEvm(e.target.value)} placeholder="0x..." style={{padding:'10px',border:'1px solid var(--border)',borderRadius:'12px'}}/>
            <button className="btn" onClick={addEvmManual}>Добавить EVM вручную</button>
          </div>
        </div>
      </div>

      {/* Сохранённые кошельки */}
      <div className="vstack" style={{gap:10}}>
        {list.length===0 && <div className="card muted">Пока нет привязанных кошельков.</div>}
        {list.map(w=>(
          <div key={w.id} className="li">
            <div className="left">
              <div className="li circle">{w.kind==='evm'?'⛓️':w.kind==='tron'?'🟣':'💳'}</div>
              <div style={{display:'flex',flexDirection:'column'}}>
                <b>{w.label || w.kind.toUpperCase()} {w.kind==='evm' && w.chainId ? `(chainId ${w.chainId})` : ''}</b>
                <span className="muted" style={{fontSize:12}}>{w.kind==='tron'? shortTron(w.address) : short(w.address)}{w.connector?` • ${w.connector}`:''}</span>
              </div>
            </div>
            <button className="btn" onClick={()=>del(w.id)}>Удалить</button>
          </div>
        ))}
      </div>

      {okMsg && <div className="card" style={{borderColor:'var(--good)', color:'var(--good)'}}>{okMsg}</div>}
      {err && <div className="card" style={{borderColor:'var(--danger)', color:'var(--danger)'}}>{err}</div>}

      <div className="card muted" style={{fontSize:12}}>
        Фолбэк «Баланс через API» использует TronScan <code>account/tokens</code> и USDT контракт <code>TR7NHqje...</code>.
      </div>
    </div>
  );
}
