import fs from 'fs';
import path from 'path';

const APPDIR = path.resolve('app');
const APIDIR = path.join(APPDIR, 'api');

const suggestedRoutes = [
  '/verify','/pin','/home',
  '/actions/topup','/actions/send','/actions/exchange','/actions/qr',
  '/referrals','/settings','/kyc','/history','/support'
];
const suggestedApis = [
  '/api/auth/verify','/api/referral/link','/api/user/verify-level',
  '/api/payment/notify','/api/wallet/balance'
];

const isRouteGroup = (name) => /^\(.*\)$/.test(name);
const isPageFile = (n) => /^page\.(tsx|ts|jsx|js)$/.test(n);
const isRouteFile = (n) => /^route\.(ts|js)$/.test(n);

function walkPages(dir, rel=[], acc=[]) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const hasPage = entries.some(e => e.isFile() && isPageFile(e.name));
  if (hasPage) {
    const segs = rel.filter(s => !isRouteGroup(s));
    let route = '/' + segs.join('/');
    if (route === '//') route = '/';
    if (route === '/') {} // keep
    acc.push(route.replace(/\/+/g,'/'));
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (['api','node_modules','.next'].includes(e.name)) continue;
    walkPages(path.join(dir, e.name), rel.concat(e.name), acc);
  }
  return acc;
}

function walkApis(dir, rel=[], acc=[]) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const hasRoute = entries.some(e => e.isFile() && isRouteFile(e.name));
  if (hasRoute) {
    const apiPath = '/api/' + rel.join('/');
    acc.push(apiPath.replace(/\/+/g,'/'));
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    walkApis(path.join(dir, e.name), rel.concat(e.name), acc);
  }
  return acc;
}

function asciiTree(rootDir, maxDepth=4) {
  function rec(dir, prefix='', depth=0) {
    if (depth>maxDepth) return [];
    let out = [];
    const names = fs.readdirSync(dir).filter(n => !['node_modules','.next'].includes(n)).sort();
    const lastIdx = names.length-1;
    names.forEach((name, i) => {
      const full = path.join(dir, name);
      const isDir = fs.existsSync(full) && fs.statSync(full).isDirectory();
      const branch = (i===lastIdx) ? '└─ ' : '├─ ';
      out.push(prefix + branch + name);
      if (isDir) {
        const ext = (i===lastIdx) ? '   ' : '│  ';
        out = out.concat(rec(full, prefix + ext, depth+1));
      }
    });
    return out;
  }
  return [path.basename(rootDir)].concat(rec(rootDir)).join('\n');
}

function mId(s){ return s.replace(/[^\w]/g,'_') || 'root'; }

function buildMermaid(routesFound, apisFound) {
  const allRoutes = new Set(routesFound);
  const allApis = new Set(apisFound);

  const missRoute = suggestedRoutes.filter(r => !allRoutes.has(r));
  const missApi   = suggestedApis.filter(a => !allApis.has(a));

  let lines = [];
  lines.push('```mermaid');
  lines.push('flowchart TD');

  // Nodes: mark missing
  const addNode = (r, missing=false) => {
    const id = mId(r);
    const label = missing ? `${r} (missing)` : r;
    lines.push(`  ${id}["${label}"]${missing ? ':::miss' : ''}`);
  };

  // Primary trio (design flow)
  const trio = ['/verify','/pin','/home'];
  trio.forEach(r => addNode(r, !allRoutes.has(r)));
  lines.push(`${mId('/verify')} --> ${mId('/pin')}`);
  lines.push(`${mId('/pin')} --> ${mId('/home')}`);

  // Children from /home
  const children = routesFound.filter(r => r!=='/' && r!=='/verify' && r!=='/pin' && r!=='/home');
  const plannedChildren = suggestedRoutes.filter(r => !['/verify','/pin','/home'].includes(r));
  const uniq = new Set([...children, ...plannedChildren]);
  for (const r of uniq) {
    addNode(r, !allRoutes.has(r));
    lines.push(`${mId('/home')} --> ${mId(r)}`);
  }

  // APIs cluster
  lines.push('  subgraph APIs');
  const apiUniq = new Set([...apisFound, ...suggestedApis]);
  for (const a of apiUniq) {
    const id = mId(a);
    const missing = !allApis.has(a);
    lines.push(`    ${id}["${missing ? a+' (missing)' : a}"]${missing ? ':::miss' : ''}`);
  }
  lines.push('  end');

  // Style for missing
  lines.push('  classDef miss stroke-dasharray: 5 5,stroke:#f59e0b,color:#f59e0b;');

  lines.push('```');
  return { mermaid: lines.join('\n'), missRoute, missApi };
}

function buildDoc({routesFound, apisFound, mermaid, missRoute, missApi, treeText}) {
  const now = new Date().toISOString().split('T')[0];
  return `# CryptoBali — Архитектурная карта\n\nДата: ${now}\n\n## Флоу/дерево (Mermaid)\n${mermaid}\n\n## Роуты (pages)\n` +
  routesFound.sort().map(r=>`- ✅ \`${r}\``).join('\n') + '\n' +
  (missRoute.length ? '\n### Планируемые (пока нет в файлах)\n' + missRoute.map(r=>`- ⛳ \`${r}\``).join('\n') + '\n' : '\n') +
  `\n## API (app/api)\n` +
  apisFound.sort().map(a=>`- ✅ \`${a}\``).join('\n') + '\n' +
  (missApi.length ? '\n### Планируемые API (пока нет в файлах)\n' + missApi.map(a=>`- ⛳ \`${a}\``).join('\n') + '\n' : '\n') +
  `\n## Дерево файлов (срез)\n\n\`\`\`text\n${treeText}\n\`\`\`\n\n> Файл сгенерирован автоматически: \`scripts/gen-arch.mjs\`.\n`;
}

function main(){
  if (!fs.existsSync(APPDIR)) {
    console.error('app/ directory not found. Run from project root (web).');
    process.exit(1);
  }
  const routesFound = Array.from(new Set(walkPages(APPDIR))).sort();
  const apisFound   = Array.from(new Set(walkApis(APIDIR))).sort();

  const { mermaid, missRoute, missApi } = buildMermaid(routesFound, apisFound);
  const treeText = asciiTree(path.resolve('.'), 3);
  const md = buildDoc({ routesFound, apisFound, mermaid, missRoute, missApi, treeText });

  fs.mkdirSync('docs', { recursive: true });
  fs.writeFileSync('docs/ARCHITECTURE.md', md, 'utf8');

  console.log('✓ docs/ARCHITECTURE.md written');
  console.log(`  routes found: ${routesFound.length}, apis found: ${apisFound.length}`);
  if (missRoute.length) console.log(`  planned routes missing: ${missRoute.length}`);
  if (missApi.length) console.log(`  planned apis missing: ${missApi.length}`);
}
main();
