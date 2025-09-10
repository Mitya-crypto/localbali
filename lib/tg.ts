export type TGUser = { id:number; username?:string; first_name?:string; last_name?:string; photo_url?:string; };
export function getTG(){ return (typeof window!=='undefined') ? (window as any).Telegram?.WebApp : undefined; }
export function getUser(): TGUser | null {
  const tg = getTG();
  if (tg?.initDataUnsafe?.user) return tg.initDataUnsafe.user as TGUser;
  if (process.env.NEXT_PUBLIC_TG_MOCK === '1') return { id: 777, username: 'mock_user', first_name: 'Mock', last_name: 'User' };
  return null;
}
