import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3010';

/**
 * Проверяем, что при первом визите пользователь видит приветственный экран
 * и таббар ещё не отображается.
 */
test.describe('Welcome experience', () => {
  test('первый визит открывает приветствие до основных вкладок', async ({ page }) => {
    const response = await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveURL(/\/verify($|\?)/);
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    await expect(page.locator('nav[aria-label="Навигация приложения"]')).toHaveCount(0);
  });
});
