'use client';
import { useEffect, useState } from 'react';
import KycUpload from '../../../components/KycUpload';
import { read, saveImage, removeImage, progress, submitKyc } from '../../../lib/kyc';

export default function KycId(){
  const [s, setS] = useState(read());
  const [p, setP] = useState(progress());
  useEffect(()=>{ const onS=()=>{ setS(read()); setP(progress()); }; window.addEventListener('storage', onS); return ()=>window.removeEventListener('storage', onS); },[]);

  const ret = '/kyc/id';

  return (
    <div className="container" style={{ padding:16, display:'grid', gap:12 }}>
      <a href="/kyc" className="linkrow">← Назад</a>
      <h1 style={{ fontSize:20, fontWeight:700 }}>ID-карта</h1>

      <KycUpload
        label="Лицевая сторона"
        storagePath="kyc.v1.state → images.id.front"
        capture="environment"
        captureRoute={{ type:'id', field:'front', ret }}
        value={s.images.id?.front}
        onPick={async(file)=>{ await saveImage({ type:'id', field:'front', file }); }}
        onRemove={()=>removeImage('id','front')}
      />

      <KycUpload
        label="Обратная сторона"
        storagePath="kyc.v1.state → images.id.back"
        capture="environment"
        captureRoute={{ type:'id', field:'back', ret }}
        value={s.images.id?.back}
        onPick={async(file)=>{ await saveImage({ type:'id', field:'back', file }); }}
        onRemove={()=>removeImage('id','back')}
      />

      <KycUpload
        label="Селфи с документом в руке"
        storagePath="kyc.v1.state → images.id.selfie"
        capture="user"
        captureRoute={{ type:'id', field:'selfie', ret }}
        value={s.images.id?.selfie}
        onPick={async(file)=>{ await saveImage({ type:'id', field:'selfie', file, maxW:1400 }); }}
        onRemove={()=>removeImage('id','selfie')}
      />

      <div className="card" style={{ display:'grid', gap:8 }}>
        <div className="linkrow"><div>Документ</div><div style={{color:'var(--muted)'}}>{p.doc ? '✓ загружен' : '—'}</div></div>
        <div className="linkrow"><div>Селфи</div><div style={{color:'var(--muted)'}}>{p.selfie ? '✓ загружено' : '—'}</div></div>
        <button className="btn" disabled={!p.ready} onClick={()=>{ submitKyc(); alert('KYC помечен как отправленный (локально).'); }}>
          Продолжить
        </button>
      </div>
    </div>
  );
}
