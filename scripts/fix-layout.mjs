import fs from 'fs';

const file = 'app/layout.tsx';
if (!fs.existsSync(file)) {
  console.error('Нет app/layout.tsx');
  process.exit(2);
}
const bak = file + '.bak';
try { fs.copyFileSync(file, bak); } catch {}

let s = fs.readFileSync(file, 'utf8');
// Удаляем ВСЕ импорты 
s = s.replace(/^\s*import\s+\s+from\s+['"][^'"]+['"];?\s*$/mg, '');

// Добавляем наш импорт первой строкой, если его нет
if (!/components\/_/.test(s)) {
  s = `import /components/_\n` + s;
}

// Вставляем если его нет
if (!/<\s*\/>/.test(s)) {
  if (/<\/Providers>\s*<\/body>/s.test(s)) {
    s = s.replace(/<\/Providers>\s*<\/body>/s, '  \n        </Providers>\n      </body>');
  } else if (/<\/body>/s.test(s)) {
    s = s.replace(/<\/body>/s, '  \n      </body>');
  } else {
    // На крайний случай — просто добавим в конец
    s = s + '\n  \n';
  }
}

fs.writeFileSync(file, s);
console.log('OK: патчён', file);
