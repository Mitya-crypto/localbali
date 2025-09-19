import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3010';
const ROUTES = [
  '/', '/home', '/profile', '/settings/language', '/settings/security',
  '/devices', '/email', '/wallets', '/scan', '/exchange',
  '/exchange/buy/methods', '/exchange/buy/usd', '/exchange/buy/cash',
  '/exchange/sell/methods', '/exchange/sell/usd', '/exchange/sell/cash',
  '/referral'
];

const stamp = new Date().toISOString().slice(0,10);
const outDir = path.join(process.env.HOME || '.', 'Desktop/Bali/docs/audit', stamp);
fs.mkdirSync(outDir, { recursive: true });

test.beforeAll(async ({ request }) => {
  try {
    const r = await request.get(BASE, { timeout: 5000 });
    if (!r.ok()) throw new Error('BASE not reachable');
  } catch (e) {
    console.error('Dev server не доступен на', BASE, e);
    throw e;
  }
});

test.describe('SSR/Hydration audit', () => {
  for (const route of ROUTES) {
    test(`route ${route}`, async ({ page }) => {
      const errors: string[] = [];
      const warns: string[] = [];

      // обход PIN
      page.addInitScript(() => {
        try {
          localStorage.setItem('pin_enabled','1');
          localStorage.setItem('pin_code','1234');
          localStorage.setItem('pin_ok','1');
        } catch {}
      });

      page.on('console', (msg) => {
        const text = msg.text();
        if (msg.type() === 'error') errors.push(`[console.${msg.type()}] ${text}`);
        if (/hydration|didn.?t match/i.test(text)) warns.push(`[hydration] ${text}`);
      });

      const res = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(300); // дать порталу смонтироваться

      // снимки и артефакты
      const safe = route.replace(/[\/:?&=]/g, '_') || 'root';
      await page.screenshot({ path: path.join(outDir, `${safe}.png`), fullPage: true });

      // гибкий поиск 
      const selector = [
        '[data-testid="tabbar"]',
        'nav[aria-label*="tab"]',
        'nav[role="navigation"]',
        '[class*="tabbar" i]',
        'nav'
      ].join(',');
      const tabbarCount = await page.locator(selector).count();

      // сводка
      const record = {
        route,
        status: res?.status(),
        tabbarFound: tabbarCount,
        consoleErrors: errors.length,
        hydrationWarns: warns.length,
      };
      fs.writeFileSync(path.join(outDir, `${safe}.json`), JSON.stringify(record, null, 2));

      // жёсткие проверки: HTTP статус и /scan без таббара
      expect(res?.status()).toBeLessThan(500);
      if (route === '/scan') {
        expect(tabbarCount).toBe(0);
      }

      // мягкие проверки: логируем, но не валим тест
      if (route !== '/scan' && tabbarCount === 0) {
        test.info().annotations.push({ type: 'warn', description: '
      }
      if (errors.length) {
        test.info().annotations.push({ type: 'warn', description: `console errors: ${errors.length}` });
      }
      if (warns.length) {
        test.info().annotations.push({ type: 'warn', description: `hydration warns: ${warns.length}` });
      }
    });
  }
});
