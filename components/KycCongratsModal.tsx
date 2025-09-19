'use client';
import { useEffect, useRef } from 'react';

export default function KycCongratsModal({ onContinue }:{ onContinue: ()=>void }){
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const cnv = canvasRef.current!;
    const ctx = cnv.getContext('2d')!;
    let w = cnv.width = window.innerWidth;
    let h = cnv.height = window.innerHeight;
    const onResize = ()=>{ w = cnv.width = window.innerWidth; h = cnv.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    type P = {x:number,y:number,vx:number,vy:number,size:number,rot:number,vr:number,clr:string};
    const colors = ['#5EC2FF','#7AE28C','#FFD166','#FF7AB6','#9C7BFF'];
    const ps:P[] = Array.from({length:120}).map((_,i)=>({
      x: Math.random()*w,
      y: -Math.random()*h/2,
      vx: (Math.random()-0.5)*1.2,
      vy: 1.5+Math.random()*2.5,
      size: 6+Math.random()*8,
      rot: Math.random()*Math.PI,
      vr: (Math.random()-0.5)*0.2,
      clr: colors[i%colors.length]
    }));
    let raf = 0;
    const tick = ()=>{
      ctx.clearRect(0,0,w,h);
      for(const p of ps){
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if(p.y>h+40){ p.y = -20; p.x = Math.random()*w; }
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.clr;
        ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  },[]);

  useEffect(()=>{
    const t = setTimeout(onContinue, 2500); // авто-переход
    return ()=>clearTimeout(t);
  },[onContinue]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999 }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
      <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center' }}>
        <div className="card" style={{ width:'90%', maxWidth:420, textAlign:'center', padding:20, background:'var(--card)', border:'1px solid var(--border)', boxShadow:'0 10px 30px var(--shadow)' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:999, background:'#eaffef', marginBottom:12 }}>
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="#22c55e" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>Поздравляем!</div>
          <div style={{ color:'var(--muted)', marginBottom:12 }}>
            Вы прошли полную верификацию. Теперь доступны все функции платформы:
            переводы, платежи по коду и т.д.
          </div>
          <button className="btn" onClick={onContinue} style={{ width:'100%' }}>Продолжить</button>
        </div>
      </div>
    </div>
  );
}
