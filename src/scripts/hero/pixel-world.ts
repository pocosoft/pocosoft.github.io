// ヒーロー背景の「ドットの世界」。昼と夜がめぐっても、AI のロボットは休まず働き続ける。
// 小さな解像度（横 240 ドット前後）で描き、CSS で拡大する（image-rendering: pixelated）。
// 画面外・タブ非表示のときは止める。動きを減らす設定では夜の静止画を1枚だけ描く。
import { CHECK, ROBOT_A, ROBOT_B, TERMINAL, type Sprite } from '../../lib/sprites';

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const css = (c: RGB) => `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0})`;

// 空の色（上から下へ5段）。真夜中・夜明け・昼・夕方
const SKY_KEYS: { t: number; bands: RGB[] }[] = [
  { t: 0, bands: ['#03060e', '#06101f', '#0a1a2a', '#0c2629', '#0f3426'].map(hex) },
  { t: 0.25, bands: ['#0c1630', '#262c58', '#5e3c66', '#b85a48', '#eea052'].map(hex) },
  { t: 0.5, bands: ['#1d5a94', '#2a70a8', '#4a8fb8', '#6eaec0', '#a6d4c0'].map(hex) },
  { t: 0.75, bands: ['#0f1736', '#36305e', '#84405e', '#cc5e3a', '#ee9e40'].map(hex) },
  { t: 1, bands: ['#03060e', '#06101f', '#0a1a2a', '#0c2629', '#0f3426'].map(hex) },
];

const skyAt = (t: number): RGB[] => {
  let i = 0;
  while (i < SKY_KEYS.length - 2 && SKY_KEYS[i + 1]!.t <= t) i++;
  const a = SKY_KEYS[i]!;
  const b = SKY_KEYS[i + 1]!;
  const k = (t - a.t) / (b.t - a.t);
  return a.bands.map((c, j) => mix(c, b.bands[j]!, k));
};

/** 0（夜）〜1（昼）の明るさ */
const daylight = (t: number) => Math.max(0, Math.sin((t - 0.25) * Math.PI * 2) * 0.5 + 0.5) ** 1.4 * (t > 0.2 && t < 0.8 ? 1 : 0.6);

const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

type Agent = {
  kind: 'carrier' | 'coder' | 'tester';
  x: number;
  dir: 1 | -1;
  carrying: boolean;
  timer: number;
  frame: number;
  home: number;
};
type Pop = { x: number; y: number; age: number };
type Spark = { x: number; y: number; vx: number; vy: number; age: number; color: string };

export type PixelWorld = { start(): void; stop(): void; destroy(): void };

export function createPixelWorld(
  canvas: HTMLCanvasElement,
  options: { animate: boolean; onClock?: (day: number, hh: number, mm: number) => void },
): PixelWorld {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const host = canvas.parentElement!;

  let W = 240;
  let H = 150;
  let P = 6; // 1ドットあたりの CSS px
  let groundY = 120;
  let t = 0.72; // 夕方から始めて、すぐ夜になるのを見せる
  let day = 1;
  let running = false;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let mountains: number[] = [];
  let hills: number[] = [];
  let stack = 0;
  let flash = 0;
  let agents: Agent[] = [];
  let pops: Pop[] = [];
  let sparks: Spark[] = [];

  const sites = () => ({
    terminal1: Math.round(W * 0.14),
    terminal2: Math.round(W * 0.26),
    build: Math.round(W * 0.5),
    lab: Math.round(W * 0.72),
  });

  const drawSprite = (s: Sprite, x: number, y: number, flip = false) => {
    const w = s.rows[0]!.length;
    s.rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[flip ? w - 1 - rx : rx]!;
        if (ch === '.') continue;
        ctx.fillStyle = s.palette[ch]!;
        ctx.fillRect(x + rx, y + ry, 1, 1);
      }
    });
  };

  const noiseLine = (seed: number, scale: number, amp: number, base: number) => {
    const out: number[] = [];
    for (let x = 0; x < W; x++) {
      const v =
        Math.sin((x + seed) / scale) * 0.6 + Math.sin((x + seed * 3) / (scale * 0.37)) * 0.3 + Math.sin((x + seed * 7) / (scale * 0.13)) * 0.1;
      out.push(Math.round(base - (v * 0.5 + 0.5) * amp));
    }
    return out;
  };

  const layout = () => {
    const rect = host.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;
    if (!cssW || !cssH) return;
    P = Math.min(10, Math.max(3, Math.round(cssW / 240)));
    W = Math.ceil(cssW / P);
    H = Math.ceil(cssH / P);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${W * P}px`;
    canvas.style.height = `${H * P}px`;
    // 地面の帯の高さは CSS の --ground-h で決める（ウィンドウはその上に置かれる）
    const groundCss = parseFloat(getComputedStyle(host).getPropertyValue('--ground-h')) || cssH * 0.16;
    groundY = H - Math.max(10, Math.round(groundCss / P));
    mountains = noiseLine(11, 34, Math.round(H * 0.18), groundY - 10);
    hills = noiseLine(57, 22, Math.round(H * 0.08), groundY - 2);
    const s = sites();
    agents = [
      { kind: 'coder', x: s.terminal1 + 11, dir: -1, carrying: false, timer: 0, frame: 0, home: s.terminal1 + 11 },
      { kind: 'coder', x: s.terminal2 + 11, dir: -1, carrying: false, timer: 300, frame: 0, home: s.terminal2 + 11 },
      { kind: 'carrier', x: s.lab - 6, dir: -1, carrying: true, timer: 0, frame: 0, home: s.lab - 6 },
      { kind: 'carrier', x: s.build + 14, dir: 1, carrying: false, timer: 0, frame: 0, home: s.lab - 12 },
      { kind: 'tester', x: s.build - 12, dir: 1, carrying: false, timer: 0, frame: 0, home: s.build - 12 },
    ];
    draw();
  };

  const update = (dt: number) => {
    // 1日は 40 秒
    t += dt / 40000;
    if (t >= 1) {
      t -= 1;
      day++;
    }
    const s = sites();
    for (const a of agents) {
      a.timer += dt;
      if (a.kind === 'carrier') {
        const target = a.carrying ? s.build + 8 : s.lab - 6;
        const dx = target - a.x;
        if (Math.abs(dx) < 1) {
          if (a.carrying) {
            a.carrying = false;
            stack++;
            if (stack >= 5) {
              stack = 0;
              flash = 600;
              for (let i = 0; i < 18; i++) {
                sparks.push({
                  x: s.build + 3,
                  y: groundY - 14,
                  vx: (hash(i + day * 13) - 0.5) * 0.06,
                  vy: -0.03 - hash(i * 3 + t) * 0.05,
                  age: 0,
                  color: i % 3 ? '#a3d160' : '#f2f7ec',
                });
              }
            }
          } else {
            a.carrying = true;
          }
        } else {
          a.dir = dx > 0 ? 1 : -1;
          a.x += a.dir * dt * 0.012;
          if (a.timer > 160) {
            a.frame ^= 1;
            a.timer = 0;
          }
        }
      } else if (a.kind === 'tester') {
        if (a.timer > 1400) {
          a.timer = 0;
          pops.push({ x: a.x + 1, y: groundY - 16, age: 0 });
        }
      } else if (a.timer > 220) {
        a.frame ^= 1;
        a.timer = 0;
      }
    }
    pops = pops.filter((p) => (p.age += dt) < 1200);
    sparks = sparks.filter((p) => {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.00012 * dt;
      return p.age < 900;
    });
    if (flash > 0) flash -= dt;

    const minutes = Math.floor(((t + 0.25) % 1) * 24 * 60);
    options.onClock?.(day, Math.floor(minutes / 60), minutes % 60);
  };

  const draw = () => {
    const light = daylight(t);
    const sky = skyAt(t);
    const skyH = groundY;

    // 空。5段の帯を、境目だけディザでなじませる
    const band = skyH / sky.length;
    for (let i = 0; i < sky.length; i++) {
      ctx.fillStyle = css(sky[i]!);
      ctx.fillRect(0, Math.floor(i * band), W, Math.ceil(band) + 1);
    }
    for (let i = 1; i < sky.length; i++) {
      const y0 = Math.floor(i * band) - 2;
      ctx.fillStyle = css(sky[i]!);
      for (let y = y0; y < y0 + 2; y++) for (let x = (y & 1); x < W; x += 2) ctx.fillRect(x, y, 1, 1);
    }

    // 星（暗いときだけ）
    const starAlpha = 1 - light;
    if (starAlpha > 0.2) {
      const count = Math.floor((W * skyH) / 260);
      for (let i = 0; i < count; i++) {
        const sx = Math.floor(hash(i * 2.1) * W);
        const sy = Math.floor(hash(i * 5.7) * skyH * 0.75);
        const tw = hash(i + Math.floor(performance.now() / 600)) > 0.85;
        if (hash(i * 9.3) > starAlpha) continue;
        ctx.fillStyle = tw ? '#a3d160' : '#e8efe4';
        ctx.fillRect(sx, sy, 1, 1);
      }
    }

    // 太陽と月
    const arc = (phase: number) => {
      const ang = phase * Math.PI;
      return { x: Math.round(W * (0.12 + 0.76 * phase)), y: Math.round(skyH * 0.85 - Math.sin(ang) * skyH * 0.65) };
    };
    const disc = (cx: number, cy: number, r: number, color: string) => {
      ctx.fillStyle = color;
      for (let y = -r; y <= r; y++) {
        const w = Math.round(Math.sqrt(r * r - y * y));
        ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1);
      }
    };
    if (t > 0.2 && t < 0.8) {
      const p = arc((t - 0.2) / 0.6);
      disc(p.x, p.y, 6, '#f6d860');
      disc(p.x, p.y, 4, '#fbe890');
    } else {
      const mt = t >= 0.8 ? t - 0.8 : t + 0.2;
      const p = arc(mt / 0.4);
      disc(p.x, p.y, 5, '#e8efe4');
      ctx.fillStyle = css(sky[1]!);
      disc(p.x + 2, p.y - 1, 4, css(mix(sky[1]!, sky[2]!, 0.5)));
    }

    // 遠くの山と手前の丘
    const shade = (night: string, dayC: string) => css(mix(hex(night), hex(dayC), light));
    ctx.fillStyle = shade('#0a1d1a', '#2f6a5a');
    for (let x = 0; x < W; x++) ctx.fillRect(x, mountains[x]!, 1, groundY - mountains[x]!);
    ctx.fillStyle = shade('#05271a', '#016435');
    for (let x = 0; x < W; x++) ctx.fillRect(x, hills[x]!, 1, groundY - hills[x]!);

    // 地面
    ctx.fillStyle = shade('#2c5a1c', '#84ba3f');
    ctx.fillRect(0, groundY, W, 2);
    ctx.fillStyle = shade('#16301a', '#3fab49');
    ctx.fillRect(0, groundY + 2, W, 2);
    ctx.fillStyle = shade('#120f0a', '#3a2a18');
    ctx.fillRect(0, groundY + 4, W, H - groundY - 4);
    ctx.fillStyle = shade('#1c160e', '#4a3620');
    for (let x = 0; x < W; x += 6) for (let y = groundY + 6; y < H; y += 5) ctx.fillRect(x + ((y / 5) % 2) * 3, y, 2, 1);

    const s = sites();

    // AI の研究所。窓の明かりは夜でも消えない
    const labW = Math.min(40, Math.round(W * 0.2));
    const labH = 26;
    const lx = s.lab;
    const ly = groundY - labH;
    ctx.fillStyle = '#0a1a0e';
    ctx.fillRect(lx - 1, ly - 1, labW + 2, labH + 1);
    ctx.fillStyle = shade('#1d2b22', '#c8d4c0');
    ctx.fillRect(lx, ly, labW, labH);
    ctx.fillStyle = shade('#0f1a12', '#8a9a88');
    ctx.fillRect(lx, ly, labW, 3);
    const now = performance.now();
    for (let wy = ly + 6; wy < groundY - 6; wy += 6) {
      for (let wx = lx + 3; wx < lx + labW - 4; wx += 6) {
        const on = hash(wx * 7 + wy * 13 + Math.floor(now / 900)) > 0.12;
        ctx.fillStyle = on ? '#f6d860' : '#3a3420';
        ctx.fillRect(wx, wy, 3, 3);
      }
    }
    // 看板
    ctx.fillStyle = '#84ba3f';
    ctx.fillRect(lx + 2, ly - 5, labW - 4, 3);

    // 端末
    for (const tx of [s.terminal1, s.terminal2]) {
      drawSprite(TERMINAL, tx, groundY - 8);
      for (let i = 0; i < 3; i++) {
        const len = 2 + Math.floor(hash(tx + i * 31 + Math.floor(now / 250)) * 5);
        ctx.fillStyle = i === 1 ? '#a3d160' : '#3fab49';
        ctx.fillRect(tx + 2, groundY - 6 + i, len, 1);
      }
    }

    // 組み上がっていく成果物
    const bx = s.build;
    for (let i = 0; i < stack; i++) {
      ctx.fillStyle = '#0a1a0e';
      ctx.fillRect(bx - 1, groundY - 5 - i * 4, 8, 5);
      ctx.fillStyle = '#84ba3f';
      ctx.fillRect(bx, groundY - 4 - i * 4, 6, 3);
      ctx.fillStyle = '#a3d160';
      ctx.fillRect(bx, groundY - 4 - i * 4, 6, 1);
    }
    if (flash > 0 && Math.floor(flash / 100) % 2 === 0) {
      ctx.fillStyle = '#f2f7ec';
      ctx.fillRect(bx - 2, groundY - 24, 10, 22);
    }

    // ロボットたち
    for (const a of agents) {
      const sprite = a.frame ? ROBOT_B : ROBOT_A;
      const x = Math.round(a.x);
      const y = groundY - 9;
      const bob = a.kind === 'coder' && a.frame ? -1 : 0;
      drawSprite(sprite, x, y + bob, a.dir < 0);
      // アンテナが点滅する
      if (Math.floor(now / 400 + a.home) % 2) {
        ctx.fillStyle = '#f2f7ec';
        ctx.fillRect(x + 3, y + bob, 1, 1);
      }
      if (a.carrying) {
        ctx.fillStyle = '#0a1a0e';
        ctx.fillRect(x + 1, y - 5, 5, 5);
        ctx.fillStyle = '#84ba3f';
        ctx.fillRect(x + 2, y - 4, 3, 3);
      }
    }

    // テストが通った印
    for (const p of pops) {
      if (p.age > 900 && Math.floor(p.age / 80) % 2) continue;
      drawSprite(CHECK, Math.round(p.x), Math.round(p.y - p.age / 120));
    }
    for (const sp of sparks) {
      ctx.fillStyle = sp.color;
      ctx.fillRect(Math.round(sp.x), Math.round(sp.y), 1, 1);
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(now - last, 100) : 16;
    last = now;
    acc += dt;
    // ドット絵らしく、描き直しは 1 秒に約 20 回
    if (acc < 48) return;
    update(acc);
    acc = 0;
    draw();
  };

  const ro = new ResizeObserver(() => layout());
  ro.observe(host);
  layout();
  if (!options.animate) {
    t = 0.9; // 夜の静止画
    stack = 3;
    draw();
  }

  return {
    start() {
      if (running || !options.animate) return;
      running = true;
      last = 0;
      canvas.dataset.running = 'true';
      raf = requestAnimationFrame(frame);
    },
    stop() {
      if (!running) return;
      running = false;
      canvas.dataset.running = 'false';
      cancelAnimationFrame(raf);
    },
    destroy() {
      this.stop();
      ro.disconnect();
    },
  };
}
