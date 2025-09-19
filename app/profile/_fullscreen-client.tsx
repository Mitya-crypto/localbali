// @ts-nocheck
'use client';
import { useEffect } from 'react';
export default function FullscreenMount() {
  useEffect(()=>{
    const el = document.documentElement;
    el.classList.add('profile-fullscreen');
    return ()=> el.classList.remove('profile-fullscreen');
  },[]);
  return null;
}
