import fs from 'fs'; import path from 'path'; import url from 'url';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function writeFileSafe(file, content){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, content, 'utf8');
  else console.log('skip (exists):', file);
}

const [, , type, name, ...rest] = process.argv;
if(!type || !name){
  console.log('Usage: node scripts/scaffold.mjs <page|api> <path> [--title "Title"]');
  process.exit(1);
}
const args = Object.fromEntries(rest.reduce((a,cur,i,arr)=>{
  if(cur.startsWith('--')) a.push([cur.replace(/^--/,''), arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : '']);
  return a;
}, []));
const Title = args.title || name.split('/').slice(-1)[0];

if(type==='page'){
  const file = path.join('app', name, 'page.tsx');
  writeFileSafe(file, `\
'use client';
export default function ${Title.replace(/\W/g,'_')}Page(){
  return (
    <div style={{padding:16}}>
      <h1 style={{margin:0}}>${Title}</h1>
      <p>Каркас страницы <code>${name}</code></p>
    </div>
  );
}
`);
  console.log('created page:', file);
} else if(type==='api'){
  const file = path.join('app','api',name,'route.ts');
  writeFileSafe(file, `\
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET(){ return NextResponse.json({ ok:true }); }
export async function POST(req:Request){
  const body = await req.json().catch(()=>null);
  return NextResponse.json({ ok:true, body });
}
`);
  console.log('created api:', file);
} else {
  console.log('type must be "page" or "api"');
  process.exit(1);
}
