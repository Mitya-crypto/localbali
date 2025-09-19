'use client';
export default function Switch({checked,onChange}:{checked:boolean;onChange:(v:boolean)=>void}){
  return (
    <button
      onClick={()=>onChange(!checked)}
      aria-pressed={checked}
      style={{
        width:52, height:32, borderRadius:999, border:'1px solid var(--border)',
        background: checked ? 'var(--primary)' : '#f3f4f6',
        position:'relative', cursor:'pointer'
      }}
    >
      <span style={{
        position:'absolute', top:2, left: checked ? 22 : 2,
        width:26, height:26, borderRadius:999, background:'#fff',
        boxShadow:'0 1px 3px rgba(0,0,0,.15)'
      }}/>
    </button>
  );
}
