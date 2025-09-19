'use client';
import * as React from 'react';
export function Card({ children, className='' }:{children:React.ReactNode; className?:string}) {
  return <div className={`rounded-2xl shadow border border-gray-200 bg-white ${className}`}>{children}</div>;
}
export function CardBody({ children, className='' }:{children:React.ReactNode; className?:string}) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
