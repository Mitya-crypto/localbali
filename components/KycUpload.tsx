'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Capture = 'user' | 'environment' | undefined;

export default function KycUpload(props: {
  label: string;
  hint?: string;
  value?: string;                        // dataURL
  onPick: (file: File)=>void | Promise<void>;
  onRemove?: ()=>void;
  capture?: Capture;                     // 'user' для селфи, 'environment' для документа (фолбэк)
  storagePath?: string;                  // отображение «пути» хранения
  captureRoute?: {                       // маршрут утилиты камеры
    type: 'passport'|'id'|'driver';
    field: 'photo'|'front'|'back'|'selfie';
    ret: string;
  };
}) {
  const { label, hint, value, onPick, onRemove, capture, storagePath, captureRoute } = props;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // скрытые инпуты (фолбэк)
  const refMedia = useRef<HTMLInputElement>(null);
  const refCamera = useRef<HTMLInputElement>(null);
  const refFile = useRef<HTMLInputElement>(null);

  const choose = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
    setOpen(false);
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await onPick(f);
    e.target.value = '';
  };

  const goCapture = ()=>{
    if (captureRoute) {
      const q = new URLSearchParams({ type:captureRoute.type, field:captureRoute.field, ret:captureRoute.ret }).toString();
      router.push(`/kyc/capture?${q}` as any);
      setOpen(false);
    } else {
      // если маршрут не передан — используем нативный capture
      choose(refCamera);
    }
  };

  return (
    <div className="card" style={{ display:'grid', gap:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <div style={{ fontWeight:600 }}>{label}</div>
        {!value && <button className="btn" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>Добавить</button>}
        {value && (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>Заменить</button>
            {onRemove && <button className="btn" style={{ background:'var(--card)', border:'1px solid var(--border)' }} onClick={onRemove}>Удалить</button>}
          </div>
        )}
      </div>

      {hint && <div style={{ color:'var(--muted)', fontSize:12 }}>{hint}</div>}

      {value && !value.startsWith('data:application/pdf') && (
        <div style={{ position:'relative', width:'100%', height:180, overflow:'hidden', borderRadius:12 }}>
          <img src={value} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      )}
      {value && value.startsWith('data:application/pdf') && (
        <div style={{ color:'var(--muted)' }}>PDF загружен</div>
      )}

      {open && (
        <div className="card" style={{ display:'grid', gap:8 }}>
          <button className="linkrow" onClick={()=>choose(refMedia)}>Медиатека</button>
          <button className="linkrow" onClick={goCapture}>Сделать снимок</button>
          <button className="linkrow" onClick={()=>choose(refFile)}>Выбрать файл</button>
          <div style={{ color:'var(--muted)', fontSize:12 }}>Поддерживается JPG/PNG/HEIC/WebP и PDF (до ~10 МБ).</div>
          {storagePath && <div style={{ color:'var(--muted)', fontSize:12 }}>Хранится: <code>{storagePath}</code></div>}
        </div>
      )}

      {/* скрытые инпуты (фолбэк) */}
      <input ref={refMedia} type="file" accept="image/*" style={{ display:'none' }} onChange={onChange}/>
      <input ref={refCamera} type="file" accept="image/*" capture={capture as any} style={{ display:'none' }} onChange={onChange}/>
      <input ref={refFile} type="file" accept="image/*,application/pdf" style={{ display:'none' }} onChange={onChange}/>
    </div>
  );
}
