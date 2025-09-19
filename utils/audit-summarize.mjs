import fs from 'fs';
import path from 'path';
const root = path.resolve(process.env.HOME, 'Desktop/Bali/docs/audit');
const days = fs.readdirSync(root).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
if (!days.length) { console.error('Нет папок отчётов'); process.exit(1); }
const day = days[days.length-1];
const dir = path.join(root, day);
const rows = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json')) continue;
  const j = JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  rows.push(j);
}
rows.sort((a,b)=>a.route.localeCompare(b.route));
const md = [
  `# Audit ${day}`,
  '',
  '| Route | Status | 
  '|---|---:|---:|---:|---:|',
  ...rows.map(r=>`| ${r.route} | ${r.status ?? ''} | ${r.tabbarFound ?? 0} | ${r.consoleErrors ?? 0} | ${r.hydrationWarns ?? 0} |`)
].join('\n');
fs.writeFileSync(path.join(root, `summary-${day}.md`), md);
console.log('OK:', path.join(root, `summary-${day}.md`));
