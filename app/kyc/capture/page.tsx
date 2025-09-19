'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveImage } from '../../../lib/kyc';

type KycDocType = 'passport'|'id'|'driver';
type Field = 'photo'|'front'|'back'|'selfie';

export default function KycCapture(){
  const sp = useSearchParams();
  const router = useRouter();

  const type = (sp.get('type') || 'id') as KycDocType;
  const field = (sp.get('field') || 'front') as Field;
  const ret = decodeURIComponent(sp.get('ret') || '/kyc');

  const isSelfie = field === 'selfie';
  const facing = isSelfie ? 'user' : 'environment';

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string|undefined>();
  const [camLabel, setCamLabel] = useState<string>('');

  const overlay = useMemo(()=>({
    // рамка: для доков — соотношение 1.58 (ID-карта), селфи — круг (1:1)
    ratio: isSelfie ? 1 : 1.58
  }), [isSelfie]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        // запрашиваем видеопоток
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        if(!mounted) return;
        streamRef.current = stream;
        const v = videoRef.current!;
        v.srcObject = stream;
        v.onloadedmetadata = ()=>{ v.play().then(()=>setReady(true)).catch(()=>setReady(true)); };
        const t = stream.getVideoTracks()[0];
        setCamLabel(t.label || '');
      }catch(e:any){
        setErr(e?.message || 'Не удалось открыть камеру');
      }
    })();

    const stop = ()=>{
      const s = streamRef.current;
      if(s){ s.getTracks().forEach(tr=>tr.stop()); streamRef.current=null; }
    };
    const onHide = ()=> stop();
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stop(); });

    return ()=>{ mounted=false; stop(); window.removeEventListener('pagehide', onHide); window.removeEventListener('beforeunload', onHide); };
  }, [facing]);

  const shoot = async ()=>{
    const v = videoRef.current;
    if(!v) return;
    // подгоняем кадр под рамку
    const vw = v.videoWidth || 1280;
    const vh = v.videoHeight || 720;

    // вычисляем область вырезки под overlay.ratio
    const wantR = overlay.ratio;
    let cw = vw, ch = Math.round(vw / wantR);
    if (ch > vh) { ch = vh; cw = Math.round(vh * wantR); }
    const sx = Math.round((vw - cw)/2);
    const sy = Math.round((vh - ch)/2);

    // рендерим на канвас
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,cw,ch);
    ctx.drawImage(v, sx, sy, cw, ch, 0, 0, cw, ch);

    const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b as Blob), 'image/jpeg', 0.9)!);
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

    await saveImage({ type, field, file, maxW: 1600, quality: 0.9 });
    router.replace(ret as any);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#000', display:'grid', gridTemplateRows:'auto 1fr auto' }}>
      <div style={{ padding:12, display:'flex', alignItems:'center', justifyContent:'space-between', color:'#fff' }}>
        <button onClick={()=>router.replace(ret as any)} className="iconbtn" aria-label="Назад" style={{ color:'#fff' }}>✕</button>
        <div style={{ fontWeight:600 }}>{isSelfie ? 'Селфи' : 'Документ'}</div>
        <div style={{ opacity:0.7, fontSize:12 }}>{camLabel}</div>
      </div>

      <div style={{ position:'relative' }}>
        {!ready && !err && <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#fff' }}>Открытие камеры…</div>}
        {err && <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#fff', padding:16, textAlign:'center' }}>
          <div style={{ marginBottom:8 }}>Ошибка камеры</div>
          <div style={{ fontSize:12, opacity:0.8 }}>{err}</div>
        </div>}

        <video ref={videoRef} playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover' }} />

        {/* Оверлей-рамка */}
        <FrameOverlay selfie={isSelfie} ratio={overlay.ratio} />
      </div>

      <div style={{ padding:16, display:'flex', justifyContent:'center', gap:16 }}>
        <button onClick={shoot} className="btn" style={{ width:120, height:48, borderRadius:24 }}>
          Снять
        </button>
      </div>
    </div>
  );
}

function FrameOverlay({ selfie, ratio }:{ selfie:boolean; ratio:number }){
  // рисуем затемнение + рамку
  const styleWrap: React.CSSProperties = { position:'absolute', inset:0, pointerEvents:'none' };
  const styleMask: React.CSSProperties = { position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' };
  // вычислим рамку как 80% ширины по короткой стороне экрана
  const styleFrame: React.CSSProperties = {
    position:'absolute',
    left:'50%',
    top:'50%',
    transform:'translate(-50%,-50%)',
    width:'80%',
    aspectRatio: selfie ? '1 / 1' : `${ratio} / 1`,
    borderRadius: selfie ? 9999 : 16,
    boxShadow:'0 0 0 200vmax rgba(0,0,0,0.4)', // «дырка» при помощи тени
    outline:'2px dashed var(--accent)',
    background:'transparent'
  };
  const tip: React.CSSProperties = { position:'absolute', bottom:16, left:0, right:0, textAlign:'center', color:'#fff', fontSize:12, opacity:0.85 };
  return (
    <div style={styleWrap}>
      
      
      <div style={tip}>{selfie ? 'Держите документ рядом с лицом' : 'Разместите документ внутри рамки'}</div>
    </div>
  );
}
