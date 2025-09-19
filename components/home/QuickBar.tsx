'use client';
import Link from 'next/link';
import React from 'react';
import { tr } from '../ui/tr';

export default function QuickBar(){  const items = [
  { href:'/topup',        label: 'Пополнить',   key:'topup' },
  { href:'/actions/send', label: 'Отправить',   key:'send'  },
  { href:'/exchange',     label: 'Продажа',     key:'sell'  },
  { href:'/actions/qr',   label: 'Оплата',      key:'pay'   },
];
  return (
    <nav aria-label={tr('quick','aria','Быстрые действия')} className="page-pad" style={{margin:'8px 0 12px'}}>
      <div className="grid2" style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
        {items.map(it=>(
          <Link key={it.key} href={it.href as any} className="tile-wrap">
            <div className="tile" style={{justifyContent:'center', minHeight:64}}>
              <div className="tile-label"><strong>{it.label}</strong></div>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
