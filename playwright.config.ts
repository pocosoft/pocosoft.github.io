import { defineConfig, devices } from '@playwright/test';

// 既定ではビルド済みの dist を astro preview で配信して検査する。
// 開発サーバーに対して回したいときは BASE_URL=http://localhost:4321 を指定する。
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4322';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npm run preview -- --port 4322 --host 127.0.0.1 --ignore-lock', url: baseURL, reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grep: /@webkit/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grep: /@firefox/ },
  ],
});
