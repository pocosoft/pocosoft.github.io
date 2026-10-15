import { expect, test } from '@playwright/test';
import { blockAnalytics } from './helpers';

// 旧サイトから続く URL。ストア・AdMob・検索エンジンから参照されている
const LEGACY_URLS = [
  '/',
  '/index.html',
  '/business.html',
  '/company.html',
  '/works.html',
  '/pocomemo/privacy/ja.html',
  '/pocomemo/terms/ja.html',
  '/app-ads.txt',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
];

for (const url of LEGACY_URLS) {
  test(`${url} が 200 を返す`, async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
  });
}

test('/works.html は事業内容の実績へ転送される', async ({ page, request }) => {
  const html = await (await request.get('/works.html')).text();
  expect(html).toContain('content="0;url=/business.html#works"');
  await blockAnalytics(page);
  await page.goto('/works.html');
  await page.waitForURL(/\/business(\.html)?#works$/);
  await expect(page.locator('#works')).toBeInViewport();
});

test('sitemap と canonical が一致する', async ({ page, request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs).toEqual(['https://www.pocosoft.jp/', 'https://www.pocosoft.jp/business.html', 'https://www.pocosoft.jp/company.html']);
  await blockAnalytics(page);
  for (const [path, canonical] of [
    ['/', locs[0]],
    ['/business.html', locs[1]],
    ['/company.html', locs[2]],
  ]) {
    await page.goto(path!);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', canonical!);
  }
});
