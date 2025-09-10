'use client';

import { useEffect, useRef, useState } from 'react';
import TabBar from '@/components/ui/TabBar';

export default function ScanPage(){
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [err, setErr] = useState<string>('');
  const [facing, setFacing] = useState<'environment'|'user'>('environment');

  async function start(cam: 'environment'|'user' = facing) {
    stop();
    setErr('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cam },
        audio: false
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e:any) {
      setErr(e?.message || 'Camera error');
    }
  }

  function stop(){
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.pause();
      (videoRef.current as any).srcObject = null;
    }
  }

  useEffect(()=>{
    if (!('mediaDevices' in navigator)) {
      setErr('MediaDevices not available');
      return;
    }
    start('environment');
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const toggleFacing = async ()=>{
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    await start(next);
  };

  return (
    <div style={{minHeight:'100svh', background:'#000', color:'#fff', display:'flex', flexDirection:'column'}}>
      <div style={{position:'sticky', top:0, background:'#111', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:800}}>QR Scanner</div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={toggleFacing} style={{border:'1px solid #333', background:'#222', color:'#fff', borderRadius:8, padding:'6px 10px'}}>Flip</button>
          {stream
            ? <button onClick={stop}  style={{border:'1px solid #8b0000', background:'#330000', color:'#fff', borderRadius:8, padding:'6px 10px'}}>Stop</button>
            : <button onClick={()=>start()} style={{border:'1px solid #0b63ff', background:'#001a3d', color:'#fff', borderRadius:8, padding:'6px 10px'}}>Start</button>}
        </div>
      </div>

      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
        <div style={{position:'relative', width:'100%', maxWidth:420, aspectRatio:'3/4', background:'#111', borderRadius:16, overflow:'hidden', border:'1px solid #222'}}>
          <video ref={videoRef} playsInline muted style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          {/* простая маска прицел */}
          <div style={{position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 0 3px rgba(255,255,255,.15)'}}/>
        </div>
      </div>

      {err ? <div style={{background:'#330000', color:'#fff', padding:'8px 12px', textAlign:'center'}}>{err}</div> : null}

      <TabBar current="scan"/>
    </div>
  );
}
