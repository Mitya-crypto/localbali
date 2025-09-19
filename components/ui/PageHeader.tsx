'use client';
import React from 'react';
export default function PageHeader({title, subtitle}:{title:string; subtitle?:string}){
  return (
    <header className="page-header page-pad">
      <h1>{title}</h1>
      {subtitle && <p className="meta">{subtitle}</p>}
    </header>
  );
}
