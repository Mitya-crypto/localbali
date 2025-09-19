import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  use: {
    headless: true,
    viewport: { width: 390, height: 844 }, // iPhone Pro-ish
    ignoreHTTPSErrors: true,
    baseURL: process.env.BASE_URL || 'http://localhost:3010',
  },
  reporter: [['list'], ['html', { outputFolder: 'docs/audit/html' }]],
});
