'use client';
import React from 'react';

export type Tile = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  ok?: boolean;
  disabled?: boolean;
};

export default function ActionGrid({items}:{items: Tile[]}) {
  return (
    <div className="tile-grid page-pad">
      {items.map((it,i)=><Tile key={i} {...it}/>)}
    </div>
  );
}

function Tile({href,label,icon,badge,ok,disabled}:Tile){
  const body = (
    <div className={`tile ${disabled?'is-disabled':''}`}>
      <div className="tile-ico">{icon ?? <span className="dot"/>}</div>
      <div className="tile-label">
        <strong>{label}</strong>
        {badge && <span className="tile-badge">{badge}</span>}
      </div>
      {ok && <span className="tile-ok">✓</span>}
      {disabled && <span className="tile-soon">Soon</span>}
    </div>
  );
  return disabled ? <div className="tile-wrap">{body}</div> : <Link className="tile-wrap" href={href}>{body}</a>;
}
