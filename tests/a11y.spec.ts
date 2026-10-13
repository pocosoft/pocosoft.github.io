import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, blockAnalytics, scrollThrough } from './helpers';

for (const vp of [
  { width: 375, height: 667 },
  { width: 1440, height: 900 },
]) {
  test.describe(`アクセシビリティ ${vp.width}`, () => {
    test.use({ viewport: vp, reducedMotion: 'reduce' });
    for (const path of PAGES) {
      test(`${path}`, async ({ page }) => {
        await blockAnalytics(page);
        await page.goto(path);
        await scrollThrough(page, 4);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
        const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`);
        expect(summary).toEqual([]);
        await expect(page.locator('h1')).toHaveCount(1);
      });
    }
  });
}
