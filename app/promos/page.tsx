'use client';
import { useI18n } from '@/components/providers/I18nProvider';
import TabBar from '@/components/ui/TabBar';

export default function PromosPage(){
  const { t } = useI18n();
  return (
    <div style={{minHeight:'100svh',background:'#f7f8fa',fontFamily:'system-ui',display:'flex',flexDirection:'column'}}>
      <div style={{position:'sticky',top:0,background:'#fff',borderBottom:'1px solid #eee',padding:'12px 14px',fontWeight:800}}>
        {t('profile.promos')}
      </div>

      <div style={{padding:16,color:'#6b7280'}}>
        <p style={{margin:0}}>{t('profile.promos')} — {t('soon')}.</p>
      </div>

      <div style={{flexGrow:1}}/>
      <TabBar current="profile" />
    </div>
  );
}
