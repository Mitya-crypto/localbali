'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Index(){
  const router = useRouter();
  useEffect(()=>{
    const unlocked = sessionStorage.getItem('unlocked') === '1';
    const to = unlocked ? '/home' : '/verify';
    // безопаснее для typedRoutes:
    router.replace(to as any);
  },[router]);
  return null;
}
