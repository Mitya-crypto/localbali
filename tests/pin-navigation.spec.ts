import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3010';

const gotoPin = async (page: import('@playwright/test').Page, query = '') => {
  await page.goto(`${BASE}/pin${query}`, { waitUntil: 'domcontentloaded' });
};

test.describe('PIN unlock navigation', () => {
  test('manual PIN entry redirects after unlock', async ({ page }) => {
    page.addInitScript(() => {
      localStorage.setItem('pin_enabled', '1');
      localStorage.setItem('pin_code', '2468');
      localStorage.removeItem('pin_ok');
      localStorage.removeItem('pin_biometry');
      localStorage.removeItem('pin_biometry_request');
    });

    await gotoPin(page, '?ref=/home');

    for (const digit of ['2', '4', '6', '8']) {
      await page.getByRole('button', { name: digit }).click();
    }

    await page.waitForURL(`${BASE}/home`, { timeout: 5000 });

    const pinOk = await page.evaluate(() => localStorage.getItem('pin_ok'));
    expect(pinOk).toBe('1');
  });

  test('biometric unlock mirrors manual redirect', async ({ page }) => {
    page.addInitScript(() => {
      localStorage.setItem('pin_enabled', '1');
      localStorage.setItem('pin_code', '1357');
      localStorage.removeItem('pin_ok');
      localStorage.setItem('pin_biometry', 'ok');
    });

    await gotoPin(page, '?ref=/home');

    await page.getByRole('button', { name: 'Разблокировать биометрией' }).click();

    await page.waitForURL(`${BASE}/home`, { timeout: 5000 });

    const pinOk = await page.evaluate(() => localStorage.getItem('pin_ok'));
    expect(pinOk).toBe('1');
  });
});
