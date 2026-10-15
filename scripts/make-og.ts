// OGP 画像（1200x630）を作る。デザインを変えたときだけ手で実行し、生成した PNG をコミットする。
//   node scripts/make-og.ts
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ROBOT_A, ROBOT_B, TERMINAL, spriteToRects, type Sprite } from '../src/lib/sprites.ts';

const b64 = (path: string) => readFileSync(path).toString('base64');
const pixelFont = b64('src/assets/fonts/dotgothic16-subset.woff');
const arcadeFont = b64('node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2');
const bird = b64('src/assets/brand/bird-pixel.png');

const P = 5; // 1ドット = 5px
const sprite = (s: Sprite, x: number, y: number) =>
  `<svg style="position:absolute;left:${x}px;top:${y}px" width="${s.rows[0]!.length * P}" height="${s.rows.length * P}" shape-rendering="crispEdges">${spriteToRects(s, P)
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.fill}"/>`)
    .join('')}</svg>`;

const groundTop = 630 - 70;
const scene = [
  sprite(TERMINAL, 620, groundTop - 8 * P),
  sprite(ROBOT_A, 675, groundTop - 9 * P),
  sprite(TERMINAL, 760, groundTop - 8 * P),
  sprite(ROBOT_B, 815, groundTop - 9 * P),
  sprite(ROBOT_A, 905, groundTop - 9 * P),
].join('');

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
  @font-face { font-family: Dot; src: url(data:font/woff;base64,${pixelFont}) format('woff'); }
  @font-face { font-family: Arcade; src: url(data:font/woff2;base64,${arcadeFont}) format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative; color: #ecf3ea; font-family: Dot, sans-serif;
    background: linear-gradient(#03060e 0 22%, #06101f 22% 44%, #0a1a2a 44% 64%, #0c2629 64% 80%, #0f3426 80%); }
  .stars { position: absolute; inset: 0 0 70px 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' shape-rendering='crispEdges'%3E%3Crect x='3' y='5' width='1' height='1' fill='%23e8efe4'/%3E%3Crect x='29' y='11' width='1' height='1' fill='%23a3d160'/%3E%3Crect x='17' y='27' width='1' height='1' fill='%23e8efe4' fill-opacity='.6'/%3E%3Crect x='41' y='35' width='1' height='1' fill='%23e8efe4'/%3E%3C/svg%3E"); background-size: 192px 192px; image-rendering: pixelated; }
  .moon { position: absolute; left: 1040px; top: 70px; width: 50px; height: 50px; background: #e8efe4; clip-path: polygon(30% 0, 70% 0, 70% 10%, 90% 10%, 90% 30%, 100% 30%, 100% 70%, 90% 70%, 90% 90%, 70% 90%, 70% 100%, 30% 100%, 30% 90%, 10% 90%, 10% 70%, 0 70%, 0 30%, 10% 30%, 10% 10%, 30% 10%); }
  .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 70px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' shape-rendering='crispEdges'%3E%3Cpath fill='%233fab49' d='M0 3h16v2H0z'/%3E%3Cpath fill='%2384ba3f' d='M0 2h16v1H0zM2 1h1v1H2zM9 0h1v2H9zM13 1h1v1h-1z'/%3E%3Cpath fill='%233a2a18' d='M0 5h16v5H0z'/%3E%3Cpath fill='%234a3620' d='M3 7h2v1H3zM11 6h2v1h-2zM7 9h2v1H7z'/%3E%3C/svg%3E") repeat-x 0 -10px / 80px 50px, #3a2a18;
    image-rendering: pixelated; }
  .lab { position: absolute; left: 1010px; bottom: 70px; width: 140px; height: 120px; background: #1d2b22; border: 5px solid #0a1a0e; border-top: 15px solid #84ba3f; }
  .lab i { position: absolute; width: 15px; height: 15px; background: #f6d860; }
  .hud { position: absolute; left: 70px; top: 60px; padding: 12px 18px; background: #000; border: 4px solid #2e4234; font: 20px/1 Arcade; color: #a9b8a8; }
  .hud b { font-weight: 400; color: #a3d160; }
  h1 { position: absolute; left: 66px; top: 130px; font-size: 128px; line-height: 1.12; font-weight: 400; letter-spacing: 2px;
    text-shadow: 6px 0 0 #000, -6px 0 0 #000, 0 6px 0 #000, 0 -6px 0 #000, 6px 6px 0 #000, -6px 6px 0 #000, 6px -6px 0 #000, -6px -6px 0 #000, 12px 12px 0 #000; }
  h1 span { display: block; color: #a3d160; }
  .logo { position: absolute; left: 70px; bottom: 100px; display: flex; align-items: center; gap: 14px; font: 30px/1 Arcade; padding: 14px 18px; background: #000; border: 4px solid #f2f7ec; }
  .logo b { color: #84ba3f; font-weight: 400; }
  .logo img { width: 52px; height: 52px; image-rendering: pixelated; }
</style></head><body>
  <div class="stars"></div><div class="moon"></div>
  <div class="lab">${[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4].map((c) => `<i style="left:${12 + c * 25}px;top:${18 + r * 25}px;${(r + c) % 5 === 3 ? 'background:#3a3420' : ''}"></i>`)).join('')}</div>
  ${scene}
  <div class="ground"></div>
  <p class="hud"><b>■</b> RUNNING  DAY <b>001</b> 23:59  SLEEP <b>0</b></p>
  <h1>AIに、<span>休みはない。</span></h1>
  <div class="logo">Pocosoft<b>.</b><img src="data:image/png;base64,${bird}" alt=""></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og/default.png' });
await browser.close();
console.log('public/og/default.png を書き出しました');
