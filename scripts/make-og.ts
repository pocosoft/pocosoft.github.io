// OGP 画像（1200x630）を作る。デザインを変えたときだけ手で実行し、生成した PNG をコミットする。
//   node scripts/make-og.ts
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const bird = readFileSync('src/assets/brand/bird.png').toString('base64');

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #070b08; color: #ecf3ea;
    font-family: 'Hiragino Sans', 'Noto Sans JP', sans-serif; position: relative; }
  .grid { position: absolute; inset: 0;
    background-image: linear-gradient(to right, rgb(132 186 63 / .09) 1px, transparent 1px), linear-gradient(to bottom, rgb(132 186 63 / .09) 1px, transparent 1px);
    background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 70% 40%, #000 30%, transparent 80%); }
  .glow { position: absolute; inset: 0; background: radial-gradient(ellipse 45% 55% at 80% 30%, rgb(132 186 63 / .28), transparent 70%), radial-gradient(ellipse 40% 50% at 10% 100%, rgb(1 100 53 / .5), transparent 70%); }
  .inner { position: absolute; inset: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .chip { align-self: flex-start; font: 600 22px/1 'SF Mono', Menlo, monospace; letter-spacing: .08em; color: #a3d160;
    border: 2px solid rgb(132 186 63 / .4); background: rgb(132 186 63 / .1); border-radius: 999px; padding: 12px 22px; display: flex; gap: 12px; align-items: center; }
  .chip i { width: 12px; height: 12px; border-radius: 50%; background: #84ba3f; box-shadow: 0 0 12px #84ba3f; }
  h1 { font-size: 84px; line-height: 1.15; font-weight: 800; letter-spacing: 0; }
  h1 span { display: block; background: linear-gradient(100deg, #a3d160, #84ba3f 45%, #7ec380); -webkit-background-clip: text; color: transparent; }
  .foot { display: flex; align-items: center; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 10px; font: 600 40px/1 'SF Mono', Menlo, monospace; }
  .logo b { color: #84ba3f; }
  .logo img { width: 64px; height: 64px; }
  .tag { font: 500 22px/1 'SF Mono', Menlo, monospace; color: #849483; letter-spacing: .1em; }
</style></head><body><div class="grid"></div><div class="glow"></div>
<div class="inner">
  <div class="chip"><i></i>RUNNING 24/7</div>
  <h1>止まらないAI開発を、<span>仕組みにする。</span></h1>
  <div class="foot"><div class="logo">Pocosoft<b>.</b><img src="data:image/png;base64,${bird}" alt=""></div><div class="tag">GAME / AI TESTING / AUTONOMOUS DEV / SES</div></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: 'public/og/default.png' });
await browser.close();
console.log('public/og/default.png を書き出しました');
