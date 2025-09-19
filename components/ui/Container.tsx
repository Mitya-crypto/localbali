'use client';
import * as React from 'react';
import { APP } from '../../lib/app.config';
export default function Container({ children, className='' }:{children:React.ReactNode; className?:string}) {
  return <div className={`mx-auto w-full px-4 max-w-[${APP.MAX_WIDTH}px] ${className}`}>{children}</div>;
}
