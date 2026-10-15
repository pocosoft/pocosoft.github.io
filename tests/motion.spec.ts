import { expect, test } from '@playwright/test';
import { PAGES, blockAnalytics, scrollThrough } from './helpers';

test.describe('動き @firefox', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of PAGES) {
    test(`${path} でエラーが出ない`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await blockAnalytics(page);
      await page.goto(path);
      await scrollThrough(page);
      // 404 ページ自体が 404 を返すのは正しい動き
      const ignore = path === '/404.html' ? /googletagmanager|net::ERR_FAILED|status of 404/ : /googletagmanager|net::ERR_FAILED/;
      expect(errors.filter((e) => !ignore.test(e))).toEqual([]);
    });
  }

  test('ヒーローのアニメーションは画面外で止まる', async ({ page }) => {
    await blockAnalytics(page);
    await page.goto('/');
    const canvas = page.locator('[data-hero-canvas]');
    await expect(canvas).toHaveAttribute('data-running', 'true', { timeout: 5000 });
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await expect(canvas).toHaveAttribute('data-running', 'false');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(canvas).toHaveAttribute('data-running', 'true');
  });

  test('仕組みセクションはスクロールに合わせてステップが進む', async ({ page }) => {
    await blockAnalytics(page);
    await page.goto('/');
    const track = page.locator('[data-mech-track]');
    const box = await track.evaluate((el) => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height }));
    const active = () => page.locator('[data-step].is-active [class*="mech__step-no"]').textContent();
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), box.top + 10);
    await expect.poll(active).toBe('01');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), box.top + box.height - 900 - 10);
    await expect.poll(active).toBe('04');
  });
});

test.describe('動きを減らす設定', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  test('スクロールしなくても全部見えていて、ヒーローは止まっている', async ({ page }) => {
    await blockAnalytics(page);
    await page.goto('/');
    await page.waitForTimeout(1500);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('[data-reveal], [data-phrase]')].filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length,
    );
    expect(hidden).toBe(0);
    await expect(page.locator('[data-hero-canvas]')).toHaveAttribute('data-running', 'false');
    // 仕組みのステップは4つとも並んで見える
    await expect(page.locator('[data-step]')).toHaveCount(4);
    for (const step of await page.locator('[data-step]').all()) await expect(step).toBeVisible();
  });
});

test.describe('JavaScript なし', () => {
  test.use({ viewport: { width: 375, height: 667 }, javaScriptEnabled: false });

  for (const path of PAGES) {
    test(`${path} の内容がすべて見える`, async ({ page }) => {
      await page.goto(path);
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll('[data-reveal], [data-phrase], [data-step]')].filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length,
      );
      expect(hidden).toBe(0);
    });
  }

  test('メニューを開ける', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'メニューを開く' }).click();
    await expect(page.getByRole('navigation', { name: 'メニュー' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'メニュー' }).getByRole('link', { name: /会社概要/ })).toBeVisible();
  });
});
