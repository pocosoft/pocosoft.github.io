// ヒーロー背景のノードネットワーク。辺の上をタスクのパケットが流れ、到着したノードに波紋が広がる。
// 描画ピクセル数に上限を設け、画面外・タブ非表示のときは止める。

type Node = { x: number; y: number; vx: number; vy: number; hub: boolean };
type Packet = { a: number; b: number; t: number; speed: number };
type Ripple = { x: number; y: number; age: number };

const PIXEL_BUDGET = 2.5e6;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export type Network = { start(): void; stop(): void; destroy(): void };

export function createNetwork(canvas: HTMLCanvasElement, options: { animate: boolean }): Network {
  const ctx = canvas.getContext('2d')!;
  const coarse = matchMedia('(pointer: coarse)').matches;

  let w = 0;
  let h = 0;
  let scale = 1;
  let linkDist = 144;
  let quality = 1;
  let nodes: Node[] = [];
  let packets: Packet[] = [];
  let ripples: Ripple[] = [];
  let running = false;
  let raf = 0;
  let last = 0;
  let spawnClock = 0;
  const frameTimes: number[] = [];
  const pointer = { x: 0, y: 0, active: false };

  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  {
    const g = sprite.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(214, 245, 170, 1)');
    grad.addColorStop(0.22, 'rgba(132, 186, 63, 0.75)');
    grad.addColorStop(1, 'rgba(132, 186, 63, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }

  const makeNode = (): Node => {
    const speed = 0.006 + Math.random() * 0.018;
    const dir = Math.random() * Math.PI * 2;
    return { x: Math.random() * w, y: Math.random() * h, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed, hub: Math.random() < 0.12 };
  };

  const targetCount = () => Math.round(clamp((w * h) / 14000, 28, 140) * quality);

  const syncNodeCount = () => {
    const target = targetCount();
    while (nodes.length < target) nodes.push(makeNode());
    if (nodes.length > target) {
      nodes.length = target;
      packets = packets.filter((p) => p.a < target && p.b < target);
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const nw = rect.width;
    const nh = rect.height;
    if (!nw || !nh) return;
    // スマホのアドレスバー伸縮による高さだけの小さな変化は無視する
    if (coarse && w && Math.abs(nw - w) < 1 && Math.abs(nh - h) / h < 0.15) return;
    const dpr = window.devicePixelRatio || 1;
    scale = Math.min(dpr, coarse ? 1.5 : 2, Math.sqrt(PIXEL_BUDGET / (nw * nh)));
    canvas.width = Math.round(nw * scale);
    canvas.height = Math.round(nh * scale);
    if (w && h) {
      for (const n of nodes) {
        n.x *= nw / w;
        n.y *= nh / h;
      }
    }
    w = nw;
    h = nh;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    linkDist = 9 * rem;
    syncNodeCount();
    if (!running) draw();
  };

  const spawnPacket = (from?: number) => {
    if (packets.length >= Math.round(24 * quality) || nodes.length < 2) return;
    const a = from ?? Math.floor(Math.random() * nodes.length);
    const na = nodes[a]!;
    const candidates: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i === a) continue;
      const nb = nodes[i]!;
      const dx = nb.x - na.x;
      const dy = nb.y - na.y;
      if (dx * dx + dy * dy < linkDist * linkDist) candidates.push(i);
    }
    if (!candidates.length) return;
    const b = candidates[Math.floor(Math.random() * candidates.length)]!;
    packets.push({ a, b, t: 0, speed: 0.0006 + Math.random() * 0.0009 });
  };

  const step = (dt: number) => {
    for (const n of nodes) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < -20) n.x = w + 20;
      else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      else if (n.y > h + 20) n.y = -20;
    }
    spawnClock += dt;
    while (spawnClock > 110) {
      spawnClock -= 110;
      spawnPacket();
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i]!;
      p.t += p.speed * dt;
      if (p.t >= 1) {
        packets.splice(i, 1);
        const nb = nodes[p.b];
        if (!nb) continue;
        if (Math.random() < 0.3) ripples.push({ x: nb.x, y: nb.y, age: 0 });
        if (Math.random() < 0.55) spawnPacket(p.b);
      }
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i]!.age += dt;
      if (ripples[i]!.age > 1400) ripples.splice(i, 1);
    }
  };

  const draw = () => {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // 辺。透明度を4段階にまとめて描くことで stroke の回数を減らす
    const buckets: Path2D[] = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    const ld2 = linkDist * linkDist;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > ld2) continue;
        const k = Math.min(3, Math.floor((d2 / ld2) * 4));
        const path = buckets[k]!;
        path.moveTo(a.x, a.y);
        path.lineTo(b.x, b.y);
      }
    }
    ctx.lineWidth = 1;
    const alphas = [0.32, 0.2, 0.11, 0.05];
    buckets.forEach((path, k) => {
      ctx.strokeStyle = `rgba(132, 186, 63, ${alphas[k]})`;
      ctx.stroke(path);
    });

    // ポインタ付近のノードと結ぶ
    if (pointer.active) {
      ctx.beginPath();
      for (const n of nodes) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        if (dx * dx + dy * dy < ld2 * 1.4) {
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(n.x, n.y);
        }
      }
      ctx.strokeStyle = 'rgba(163, 209, 96, 0.22)';
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprite, pointer.x - 40, pointer.y - 40, 80, 80);
      ctx.globalCompositeOperation = 'source-over';
    }

    // ノード
    ctx.fillStyle = 'rgba(163, 209, 96, 0.75)';
    ctx.beginPath();
    for (const n of nodes) {
      if (n.hub) continue;
      ctx.moveTo(n.x + 1.6, n.y);
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.globalCompositeOperation = 'lighter';
    for (const n of nodes) {
      if (!n.hub) continue;
      ctx.drawImage(sprite, n.x - 14, n.y - 14, 28, 28);
    }

    // 波紋
    for (const r of ripples) {
      const t = r.age / 1400;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4 + t * 46, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(163, 209, 96, ${0.5 * (1 - t)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // パケット
    for (const p of packets) {
      const a = nodes[p.a];
      const b = nodes[p.b];
      if (!a || !b) continue;
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;
      const tx = a.x + (b.x - a.x) * Math.max(0, p.t - 0.18);
      const ty = a.y + (b.y - a.y) * Math.max(0, p.t - 0.18);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(190, 235, 130, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.drawImage(sprite, x - 9, y - 9, 18, 18);
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? now - last : 16;
    if (dt < 15) return; // 120Hz 画面でも 60fps 程度に抑える
    last = now;
    step(Math.min(dt, 50));
    draw();

    frameTimes.push(dt);
    if (frameTimes.length >= 60) {
      const avg = frameTimes.reduce((s, v) => s + v, 0) / frameTimes.length;
      frameTimes.length = 0;
      if (avg > 22 && quality > 0.4) {
        quality *= 0.75;
        syncNodeCount();
      }
    }
  };

  const onPointer = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = e.pointerType === 'mouse' && pointer.y >= 0 && pointer.y <= rect.height;
  };
  const onLeave = () => (pointer.active = false);

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();
  // 静止画でも少しだけ流れを見せる
  for (let i = 0; i < 14; i++) spawnPacket();
  packets.forEach((p) => (p.t = Math.random() * 0.9));
  draw();

  if (options.animate) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerleave', onLeave);
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
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
    },
  };
}
