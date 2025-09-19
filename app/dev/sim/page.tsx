'use client';
import { useEffect, useState } from 'react';

export default function Sim(){
  const [path,setPath]=useState('/verify');
  useEffect(()=>{ try{ const u=new URL(window.location.href); const p=u.searchParams.get('path'); if(p) setPath(p); }catch{} },[]);
  const set = (p:string)=>{ setPath(p); const u=new URL(window.location.href); u.searchParams.set('path',p); history.replaceState(null,'',u.toString()); };
  return (
    <div style={{padding:16,fontFamily:'system-ui',display:'grid',gap:12}}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button onClick={()=>set('/verify')} style={{border:'1px solid #ddd',borderRadius:8,padding:'6px 10px'}}>verify</button>
        <button onClick={()=>set('/pin')} style={{border:'1px solid #ddd',borderRadius:8,padding:'6px 10px'}}>pin</button>
        <button onClick={()=>set('/home')} style={{border:'1px solid #ddd',borderRadius:8,padding:'6px 10px'}}>home</button>
        <input value={path} onChange={e=>setPath(e.target.value)} style={{flex:1,minWidth:220,border:'1px solid #ddd',borderRadius:8,padding:'6px 10px'}}/>
        <button onClick={()=>set(path)} style={{border:'1px solid #ddd',borderRadius:8,padding:'6px 10px'}}>go</button>
      </div>
      <div style={{width:375,height:680,border:'1px solid #ddd',borderRadius:24,overflow:'hidden',boxShadow:'0 10px 30px rgba(0,0,0,.08)'}}>
        <iframe src={path} style={{width:'100%',height:'100%',border:0}} />
      </div>
    </div>
  );
}
