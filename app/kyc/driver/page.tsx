'use client';
import { useEffect, useState } from 'react';
import KycUpload from '../../../components/KycUpload';
import { read, saveImage, removeImage, progress, submitKyc } from '../../../lib/kyc';

export default function KycDriver(){
  const [s, setS] = useState(read());
  const [p, setP] = useState(progress());
  useEffect(()=>{ const onS=()=>{ setS(read()); setP(progress()); }; window.addEventListener('storage', onS); return ()=>window.removeEventListener('storage', onS); },[]);

  const ret = '/kyc/driver';

  return (
    <div className="container" style={{ padding:16, display:'grid', gap:12 }}>
      <a href="/kyc" className="linkrow">← Назад</a>
      <h1 style={{ fontSize:20, fontWeight:700 }}>Водительское удостоверение</h1>

      <KycUpload
        label="Лицевая сторона"
        storagePath="kyc.v1.state → images.driver.front"
        capture="environment"
        captureRoute={{ type:'driver', field:'front', ret }}
        value={s.images.driver?.front}
        onPick={async(file)=>{ await saveImage({ type:'driver', field:'front', file }); }}
        onRemove={()=>removeImage('driver','front')}
      />

      <KycUpload
        label="Обратная сторона"
        storagePath="kyc.v1.state → images.driver.back"
        capture="environment"
        captureRoute={{ type:'driver', field:'back', ret }}
        value={s.images.driver?.back}
        onPick={async(file)=>{ await saveImage({ type:'driver', field:'back', file }); }}
        onRemove={()=>removeImage('driver','back')}
      />

      <KycUpload
        label="Селфи с документом в руке"
        storagePath="kyc.v1.state → images.driver.selfie"
        capture="user"
        captureRoute={{ type:'driver', field:'selfie', ret }}
        value={s.images.driver?.selfie}
        onPick={async(file)=>{ await saveImage({ type:'driver', field:'selfie', file, maxW:1400 }); }}
        onRemove={()=>removeImage('driver','selfie')}
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
