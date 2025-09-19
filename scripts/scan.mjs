import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';

const project = process.argv[2] || process.env.PROJECT || process.cwd();
const outDir = path.join(project, '.scan');
fs.mkdirSync(outDir, {recursive: true});

const ignore = new Set(['node_modules','.next','.git','dist','build','.turbo','.vercel','.cache','.idea','.vscode','out']);
const files = [];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(ent.name.startsWith('.DS')) continue;
    const full = path.join(dir, ent.name);
    if(ent.isDirectory()){
      if(ignore.has(ent.name)) continue;
      walk(full);
    } else files.push(full);
  }
}
walk(project);

// package.json summary
let pkgSummary = {};
const pkgPath = path.join(project,'package.json');
if(fs.existsSync(pkgPath)){
  const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
  pkgSummary = {
    name: pkg.name, version: pkg.version,
    scripts: pkg.scripts || {},
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {}
  };
  fs.writeFileSync(path.join(outDir,'package-summary.json'), JSON.stringify(pkgSummary,null,2));
} else {
  fs.writeFileSync(path.join(outDir,'package-summary.json'), JSON.stringify({error:'package.json not found'},null,2));
}

// env keys (без значений)
const envCandidates = ['.env','.env.local','.env.development','.env.production','.env.test'];
let envTxt = '';
for(const f of envCandidates){
  const p = path.join(project,f);
  if(fs.existsSync(p)){
    const content = fs.readFileSync(p,'utf8');
    const keys = [...content.matchAll(/^\s*([A-Z0-9_]+)\s*=/gmi)].map(m=>m[1]);
    envTxt += `# ${f}\n${keys.map(k=>`- ${k}=***`).join('\n')}\n\n`;
  }
}
fs.writeFileSync(path.join(outDir,'env.txt'), envTxt || 'No env files found.\n');

// routes from app/*/page.*
const routeFiles = files.filter(f=>/\/app\/.*\/page\.(tsx|jsx|mdx|ts|js)$/.test(f));
function toRoute(p){
  let rel = p.split('/app/')[1].replace(/\/page\.(tsx|jsx|mdx|ts|js)$/, '');
  const segments = rel.split('/').filter(s=>!/^\(.*\)$/.test(s));
  let route = '/'+segments.join('/');
  if(route === '/') return '/';
  return route.replace(/\/index$/,'') || '/';
}
const routes = Array.from(new Set(routeFiles.map(toRoute))).sort();
fs.writeFileSync(path.join(outDir,'routes.txt'), routes.join('\n')+'\n');

// grep helpers
function grepRegex(regex){
  const res = [];
  for(const f of files){
    if(!/\.(ts|tsx|js|jsx|mdx|css|scss)$/.test(f)) continue;
    const content = fs.readFileSync(f,'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line,idx)=>{
      if(regex.test(line)) res.push(`${path.relative(project,f)}:${idx+1}:${line.trim().slice(0,200)}`);
    });
  }
  return res;
}

const mentions = {
  /\.tsx$/.test(f)),
  I18nProvider: grepRegex(/\bI18nProvider\b/),
  ThemeProvider: grepRegex(/\bThemeProvider\b|\bnext-themes\b/),
  Scanner: grepRegex(/\bBarcodeDetector\b|@zxing\//),
  RoutesMentions: grepRegex(/\/(home|profile|settings\/language|settings\/security|scan|invest|devices|email|wallets)\b/)
};
fs.writeFileSync(path.join(outDir,'has-\n' : 'NOT FOUND\n');
fs.writeFileSync(path.join(outDir,'has-I18nProvider.txt'), mentions.I18nProvider.join('\n') || 'NOT FOUND\n');
fs.writeFileSync(path.join(outDir,'has-ThemeProvider.txt'), mentions.ThemeProvider.join('\n') || 'NOT FOUND\n');
fs.writeFileSync(path.join(outDir,'has-Scanner.txt'), mentions.Scanner.join('\n') || 'NOT FOUND\n');
fs.writeFileSync(path.join(outDir,'has-routes-mentions.txt'), mentions.RoutesMentions.join('\n') || 'NOT FOUND\n');

// TypeScript check
let tscTxt = '';
try {
  const hasTs = pkgSummary?.devDependencies?.typescript || pkgSummary?.dependencies?.typescript || fs.existsSync(path.join(project,'tsconfig.json'));
  if(hasTs){
    const ver = execSync('npx --yes tsc -v',{cwd:project,stdio:'pipe'}).toString().trim();
    tscTxt += `TypeScript ${ver}\n`;
    try{
      execSync('npx --yes tsc --noEmit',{cwd:project,stdio:'pipe'});
      tscTxt += 'tsc: OK (no errors)\n';
    } catch(e){
      tscTxt += 'tsc errors:\n' + (e.stdout?.toString()||e.message) + '\n' + (e.stderr?.toString()||'') + '\n';
    }
  } else tscTxt = 'TypeScript not configured.\n';
} catch(e){ tscTxt += 'tsc check failed: '+e.message+'\n'; }
fs.writeFileSync(path.join(outDir,'tsc.txt'), tscTxt);

// Git info
let gitTxt = '';
if(fs.existsSync(path.join(project,'.git'))){
  try{ gitTxt += execSync('git status --porcelain=v1 -b',{cwd:project}).toString(); }catch{}
  try{ gitTxt += '\n'+execSync('git remote -v',{cwd:project}).toString(); }catch{}
} else gitTxt = 'Not a git repository.\n';
fs.writeFileSync(path.join(outDir,'git.txt'), gitTxt);

// README
const readme = [
  '# CryptoBali — скан проекта',
  '',
  '## Сводка окружения',
  'см. `env.txt`',
  '',
  '## package.json (ключевые пакеты/скрипты)',
  'см. `package-summary.json`',
  '',
  '## Маршруты (app/*/page.*)',
  'см. `routes.txt`',
  '',
  '## Важные упоминания',
  '- 
  '- I18nProvider → `has-I18nProvider.txt`',
  '- ThemeProvider → `has-ThemeProvider.txt`',
  '- Сканер (BarcodeDetector/ZXing) → `has-Scanner.txt`',
  '- Пути (/home, /profile, /settings/*, /scan, /invest) → `has-routes-mentions.txt`',
  '',
  '## TypeScript',
  'см. `tsc.txt`',
  '',
  '## Git',
  'см. `git.txt`',
  '',
  '— Автогенерировано: ' + new Date().toISOString()
].join('\n');
fs.writeFileSync(path.join(outDir,'README.md'), readme);

// Console
console.log('OK:', path.relative(process.cwd(), outDir));
console.log(['env.txt','package-summary.json','routes.txt','has-\n'));
