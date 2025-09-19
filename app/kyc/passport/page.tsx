'use client';
import { useEffect, useState } from 'react';
import KycUpload from '../../../components/KycUpload';
import { read, saveImage, removeImage, progress, submitKyc } from '../../../lib/kyc';

export default function KycPassport(){
  const [s, setS] = useState(read());
  const [p, setP] = useState(progress());
  useEffect(()=>{ const onS=()=>{ setS(read()); setP(progress()); }; window.addEventListener('storage', onS); return ()=>window.removeEventListener('storage', onS); },[]);

  const ret = '/kyc/passport';

  return (
    <div className="container" style={{ padding:16, display:'grid', gap:12 }}>
      <a href="/kyc" className="linkrow">← Назад</a>
      <h1 style={{ fontSize:20, fontWeight:700 }}>Паспорт</h1>

      <KycUpload
        label="Страница с фото"
        storagePath="kyc.v1.state → images.passport.photo"
        capture="environment"
        captureRoute={{ type:'passport', field:'photo', ret }}
        value={s.images.passport?.photo}
        onPick={async(file)=>{ await saveImage({ type:'passport', field:'photo', file }); }}
        onRemove={()=>removeImage('passport','photo')}
      />

      <KycUpload
        label="Селфи с документом в руке"
        hint="Держите документ рядом с лицом. Лицо и данные должны быть читаемы."
        storagePath="kyc.v1.state → images.passport.selfie"
        capture="user"
        captureRoute={{ type:'passport', field:'selfie', ret }}
        value={s.images.passport?.selfie}
        onPick={async(file)=>{ await saveImage({ type:'passport', field:'selfie', file, maxW:1400 }); }}
        onRemove={()=>removeImage('passport','selfie')}
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
