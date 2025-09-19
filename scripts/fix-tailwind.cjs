const fs=require('fs');
const file = fs.existsSync('tailwind.config.ts') ? 'tailwind.config.ts'
           : fs.existsSync('tailwind.config.js') ? 'tailwind.config.js'
           : null;
if(!file){ console.log('tailwind.config.* not found — пропускаю'); process.exit(0); }
let s=fs.readFileSync(file,'utf8'); const before=s;
const want="./components/**/*.{ts,tsx,js,jsx}";
const rx=/content\s*:\s*\[([\s\S]*?)\]/m;
const m=s.match(rx);
if(m && !m[1].includes('components/**/*')){
  s=s.replace(rx, (all,inner)=>{
    const pref = inner.trim().length ? inner.replace(/^\s*/,'') : '';
    const comma = pref ? ', ' : '';
    return `content: [ ${want}${comma}${inner} ]`;
  });
}
if(s!==before){ fs.writeFileSync(file,s); console.log('patched:',file); } else { console.log('tailwind content OK'); }
