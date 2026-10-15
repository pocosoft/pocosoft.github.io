import type { Page } from '@playwright/test';

export const PAGES = ['/', '/business.html', '/company.html', '/404.html'];

export const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 3840, height: 2160 },
];

/** Google アナリティクスへの送信を止める */
export const blockAnalytics = (page: Page) => page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());

/** ページを上から下まで一定間隔でスクロールし、各位置で cb を呼ぶ */
export async function scrollThrough(page: Page, steps = 10, cb?: (i: number) => Promise<void>) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round((height * i) / steps));
    await page.waitForTimeout(120);
    if (cb) await cb(i);
  }
}
