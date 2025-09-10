'use client';
import TabBar from '@/components/ui/TabBar';

export default function InvestPage(){
  return (
    <div style={{minHeight:'100svh',background:'#f7f8fa',fontFamily:'system-ui',display:'flex',flexDirection:'column'}}>
      <div style={{position:'sticky',top:0,background:'#fff',borderBottom:'1px solid #eee',padding:'12px 14px',fontWeight:800}}>
        Инвестиции
      </div>

      <div style={{padding:16}}>
        <div style={{background:'#fff',border:'1px solid #eee',borderRadius:16,padding:14}}>
          Здесь будут продукты и портфель. (WIP)
        </div>
      </div>

      <TabBar current="invest"/>
    </div>
  );
}
