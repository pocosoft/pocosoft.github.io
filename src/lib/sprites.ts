// ドット絵のスプライト。1文字が1ドットで、「.」は透明。色は palette の文字で指定する。
export type Sprite = { rows: string[]; palette: Record<string, string> };

export const ROBOT_PALETTE: Record<string, string> = {
  o: '#0a1a0e', // 輪郭
  w: '#e8efe4', // 頭
  g: '#a3d160', // 目
  b: '#3fab49', // 胴体
  d: '#016435', // 胴体の影
  a: '#a3d160', // アンテナの先
};

// 7x9。2コマで足を動かす
export const ROBOT_A: Sprite = {
  palette: ROBOT_PALETTE,
  rows: ['...a...', '...o...', '.ooooo.', '.owwwo.', '.owgwo.', '.ooooo.', 'obbbbbo', '.obdbo.', '.o...o.'],
};
export const ROBOT_B: Sprite = {
  palette: ROBOT_PALETTE,
  rows: ['...a...', '...o...', '.ooooo.', '.owwwo.', '.owgwo.', '.ooooo.', 'obbbbbo', '.obdbo.', '..o.o..'],
};

// 端末（10x8）。画面の行はコードで描き足す
export const TERMINAL: Sprite = {
  palette: { o: '#0a1a0e', f: '#2e4234', s: '#071108', k: '#1f2d23' },
  rows: ['oooooooooo', 'offffffffo', 'ofssssssfo', 'ofssssssfo', 'ofssssssfo', 'offffffffo', 'oooooooooo', '...okko...'],
};

// チェックマーク（5x4）
export const CHECK: Sprite = {
  palette: { c: '#a3d160', o: '#0a1a0e' },
  rows: ['....c', '...c.', 'c.c..', '.c...'],
};

/** SVG の <rect> の並びにする（Astro 側で使う） */
export function spriteToRects(sprite: Sprite, scale = 1): { x: number; y: number; w: number; h: number; fill: string }[] {
  const out: { x: number; y: number; w: number; h: number; fill: string }[] = [];
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x]!;
      if (ch === '.') {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === ch) run++;
      out.push({ x: x * scale, y: y * scale, w: run * scale, h: scale, fill: sprite.palette[ch]! });
      x += run;
    }
  });
  return out;
}
