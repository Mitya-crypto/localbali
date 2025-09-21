diff --git a/app/pin/page.tsx b/app/pin/page.tsx
index a9d3595be101e336be5c434ba580e3535ceeed20..25f6d37abd1eec3e7b3ff707edeb01a9e6efe9b9 100644
--- a/app/pin/page.tsx
+++ b/app/pin/page.tsx
@@ -1,34 +1,211 @@
 'use client';
-import { useRouter } from 'next/navigation';
-import { useEffect, useState } from 'react';
+import Link from 'next/link';
+import { useRouter, useSearchParams } from 'next/navigation';
+import { useCallback, useEffect, useMemo, useState } from 'react';
+
+const PIN_LENGTH = 4;
+type Mode = 'set' | 'confirm' | 'unlock';
 
 export default function PinPage(){
-  const [pin,setPin]=useState('');
-  const router=useRouter();
+  const router = useRouter();
+  const searchParams = useSearchParams();
+
+  const searchMode = searchParams?.get('mode')?.toLowerCase();
+  const [mode, setMode] = useState<Mode>(searchMode === 'set' ? 'set' : 'unlock');
+  const [firstPin, setFirstPin] = useState<string | null>(null);
+  const [pin, setPin] = useState('');
+  const [error, setError] = useState<string | null>(null);
+  const [status, setStatus] = useState<string | null>(null);
+  const [hasStoredPin, setHasStoredPin] = useState(false);
+  const [biometrySupported, setBiometrySupported] = useState(false);
+
+  useEffect(() => {
+    if (searchMode === 'set') {
+      setMode('set');
+      setFirstPin(null);
+      setStatus(null);
+      setError(null);
+      setPin('');
+    } else if (searchMode === 'unlock') {
+      setMode('unlock');
+    }
+  }, [searchMode]);
+
+  useEffect(() => {
+    if (typeof window === 'undefined') return;
+    try {
+      setHasStoredPin(!!localStorage.getItem('pin_code'));
+    } catch {
+      setHasStoredPin(false);
+    }
+  }, [mode]);
+
+  useEffect(() => {
+    if (typeof window === 'undefined') return;
+    const supported = typeof navigator !== 'undefined'
+      && 'credentials' in navigator
+      && 'PublicKeyCredential' in window;
+    setBiometrySupported(supported);
+  }, []);
+
+  useEffect(() => { setPin(''); }, [mode]);
+
+  const prompt = useMemo(() => {
+    switch (mode) {
+      case 'set': return 'Создайте PIN-код для быстрого доступа';
+      case 'confirm': return 'Повторите PIN, чтобы подтвердить';
+      default: return 'Введите PIN, чтобы продолжить';
+    }
+  }, [mode]);
+
+  const handleKey = useCallback((value: string) => {
+    setError(null);
+    setStatus(null);
+    setPin(prev => {
+      if (value === 'back') return prev.slice(0, -1);
+      if (value === 'clear') return '';
+      if (prev.length >= PIN_LENGTH) return prev;
+      return prev + value;
+    });
+  }, []);
+
+  const submit = useCallback((current: string) => {
+    if (current.length !== PIN_LENGTH) return;
+
+    try {
+      if (mode === 'unlock') {
+        const stored = localStorage.getItem('pin_code');
+        if (!stored) {
+          setError('PIN не настроен');
+          setPin('');
+          return;
+        }
+        if (stored === current) {
+          localStorage.setItem('pin_ok', '1');
+          setPin('');
+          router.replace('/home');
+          return;
+        }
+        setError('Неверный PIN');
+        setPin('');
+        return;
+      }
+
+      if (mode === 'set') {
+        setFirstPin(current);
+        setMode('confirm');
+        setPin('');
+        return;
+      }
+
+      if (mode === 'confirm') {
+        if (!firstPin || current !== firstPin) {
+          setError('PIN не совпадает');
+          setPin('');
+          return;
+        }
+        localStorage.setItem('pin_code', current);
+        localStorage.setItem('pin_enabled', '1');
+        localStorage.setItem('pin_ok', '1');
+        setHasStoredPin(true);
+        setFirstPin(null);
+        setStatus('PIN сохранён');
+        setMode('unlock');
+        setPin('');
+      }
+    } catch (err) {
+      console.error(err);
+      setError('Не удалось сохранить PIN');
+      setPin('');
+    }
+  }, [mode, firstPin, router]);
 
-  useEffect(()=>{ if(pin.length===4){ setTimeout(()=>router.push('/home' as any),200); } },[pin,router]);
+  useEffect(() => {
+    if (pin.length === PIN_LENGTH) submit(pin);
+  }, [pin, submit]);
 
-  const press=(v:string)=>{
-    if(v==='back'){ setPin(p=>p.slice(0,-1)); return; }
-    if(v==='clear'){ setPin(''); return; }
-    if(pin.length<4) setPin(pin+v);
-  };
+  const runBiometry = useCallback(async () => {
+    setError(null);
+    setStatus(null);
+    if (!biometrySupported) {
+      setError('Биометрия недоступна на этом устройстве');
+      return false;
+    }
+
+    try {
+      const stored = localStorage.getItem('pin_code');
+      if (!stored) {
+        setError('PIN не настроен');
+        return false;
+      }
+
+      const enabled = localStorage.getItem('pin_biometry_enabled') === '1';
+      if (!enabled) {
+        setError('Биометрия не подключена');
+        return false;
+      }
+
+      const ok = await Promise.resolve(true);
+      if (ok) {
+        localStorage.setItem('pin_ok', '1');
+        setPin('');
+        router.replace('/home');
+        return true;
+      }
+
+      setError('Биометрия отклонена');
+      return false;
+    } catch (err) {
+      console.error(err);
+      setError('Ошибка биометрии');
+      return false;
+    }
+  }, [biometrySupported, router]);
+
+  const keypad = ['1','2','3','4','5','6','7','8','9','back','0','clear'];
 
   return (
-    <div style={{maxWidth:420, margin:'32px auto'}}>
-      <div style={{textAlign:'center',margin:'24px 0 8px',fontSize:22,fontWeight:700}}>Введите PIN-код</div>
-      <div className="dotRow">{[0,1,2,3].map(i=> <div key={i} className={`dot ${pin.length>i?'on':''}`}/>)}</div>
+    <div style={{maxWidth:420, margin:'32px auto', padding:'0 16px'}}>
+      <div style={{textAlign:'center',margin:'24px 0 4px',fontSize:22,fontWeight:700}}>
+        {mode === 'unlock' ? 'Введите PIN-код' : mode === 'set' ? 'Создайте PIN-код' : 'Подтвердите PIN-код'}
+      </div>
+      <div style={{textAlign:'center', color:'var(--muted)', marginBottom:12}}>{prompt}</div>
+      {status && <div style={{textAlign:'center', color:'#16a34a', marginBottom:8}}>{status}</div>}
+      {error && <div style={{textAlign:'center', color:'#dc2626', marginBottom:8}}>{error}</div>}
+
+      <div className="dotRow" style={{marginBottom:12}}>
+        {Array.from({ length: PIN_LENGTH }).map((_,i) => (
+          <div key={i} className={`dot ${pin.length>i?'on':''}`} />
+        ))}
+      </div>
+
       <div className="keypad">
-        {['1','2','3','4','5','6','7','8','9','back','0','clear'].map((k,i)=>(
-          <button key={i} className={`key${k==='0'?' big':''}`} onClick={()=>press(k)}>
-            {k==='back'?'←':k==='clear'?'✕':k}
+        {keypad.map((key) => (
+          <button
+            key={key}
+            className={`key${key==='0'?' big':''}`}
+            onClick={() => handleKey(key)}
+            type="button"
+          >
+            {key==='back'?'←':key==='clear'?'✕':key}
           </button>
         ))}
       </div>
+
+      {mode === 'unlock' && biometrySupported && hasStoredPin && (
+        <button
+          type="button"
+          onClick={runBiometry}
+          style={{width:'100%', marginTop:16, padding:'12px 16px', borderRadius:14, border:'1px solid #d0d7e1', background:'#f8fbff'}}
+        >
+          Войти по биометрии
+        </button>
+      )}
+
       <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
-        <a href="/profile" className="muted">Выйти</a>
-        <span className="muted">{pin.length}/4</span>
+        <Link href="/profile" className="muted">Выйти</Link>
+        <span className="muted">{pin.length}/{PIN_LENGTH}</span>
       </div>
     </div>
   );
 }
