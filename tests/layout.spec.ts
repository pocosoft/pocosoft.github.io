import { expect, test } from '@playwright/test';
import { PAGES, VIEWPORTS, blockAnalytics, scrollThrough } from './helpers';

const MIN_FONT_PX = 14;

for (const vp of VIEWPORTS) {
  // WebKit はスマホ幅だけ検査する
  const tags = vp.width <= 390 ? ' @webkit' : '';
  test.describe(`${vp.width}x${vp.height}${tags}`, () => {
    test.use({ viewport: vp });

    for (const path of PAGES) {
      test(`${path} は横にはみ出さず、文字が小さすぎない`, async ({ page }, info) => {
        await blockAnalytics(page);
        await page.goto(path);

        const overflowAt: number[] = [];
        await scrollThrough(page, 10, async (i) => {
          const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (over > 0) overflowAt.push(i);
        });
        expect(overflowAt, 'ページ全体が横スクロールしない').toEqual([]);

        const result = await page.evaluate((minPx) => {
          const vw = document.documentElement.clientWidth;
          const offscreen: string[] = [];
          const small: string[] = [];
          const describe = (el: Element) =>
            `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')} 「${(el.textContent ?? '').trim().slice(0, 24)}」`;

          // 文字が見えていてよい範囲。overflow で切り取る祖先があれば、その範囲に狭める。
          // 横スクロール領域・はみ出してよい装飾・意図した省略（…）の中は null（検査しない）
          const visibleBox = (el: Element): { left: number; right: number } | null => {
            let left = 0;
            let right = vw;
            for (let a: Element | null = el; a; a = a.parentElement) {
              if (a.hasAttribute('data-overflow-ok')) return null;
              const cs = getComputedStyle(a);
              if (a === el && cs.textOverflow === 'ellipsis') return null;
              if (a !== el && (cs.overflowX === 'auto' || cs.overflowX === 'scroll')) return null;
              if (cs.overflowX === 'hidden' || cs.overflowX === 'clip') {
                const r = a.getBoundingClientRect();
                left = Math.max(left, r.left);
                right = Math.min(right, r.right);
              }
            }
            return { left, right };
          };

          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const seen = new Set<Element>();
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent?.trim()) continue;
            const el = n.parentElement;
            if (!el) continue;
            if (el.closest('.sr-only, script, style, template, [popover]:not(:popover-open)')) continue;
            if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: false })) continue;

            if (!seen.has(el)) {
              seen.add(el);
              const size = parseFloat(getComputedStyle(el).fontSize);
              if (size < minPx - 0.01) small.push(`${size.toFixed(1)}px ${describe(el)}`);
            }

            const box = visibleBox(el);
            if (!box) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            for (const r of range.getClientRects()) {
              if (r.width === 0) continue;
              if (r.right > box.right + 1 || r.left < box.left - 1) {
                offscreen.push(`${Math.round(r.left)}..${Math.round(r.right)} ${describe(el)}`);
                break;
              }
            }
          }
          const svgText = document.querySelectorAll('svg text').length;
          return { offscreen, small, svgText };
        }, MIN_FONT_PX);

        expect(result.offscreen, '画面外にはみ出した文字').toEqual([]);
        expect(result.small, `${MIN_FONT_PX}px 未満の文字`).toEqual([]);
        expect(result.svgText, 'SVG の <text> は使わない（文字サイズを検査できないため）').toBe(0);

        if (info.project.name === 'chromium') {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.waitForTimeout(300);
          await info.attach('top', { body: await page.screenshot({ type: 'jpeg', quality: 70 }), contentType: 'image/jpeg' });
        }
      });
    }
  });
}
