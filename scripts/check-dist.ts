// ビルド後の dist を検査する。
// - 旧サイトから引き継ぐファイルが1バイトも変わっていないこと（ストア・AdMob から参照されている）
// - 必要なページ・ファイルがそろっていること
// - 仮の文字列（TODO など）が残っていないこと
// - 日本語の文中に余計な半角スペースが入っていないこと
// - サイト内リンクとページ内アンカーがすべて解決すること
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const allowTodo = process.env.ALLOW_TODO === '1';
const errors: string[] = [];

// 旧サイト（Jekyll 時代）のファイルの SHA-256
const PRESERVED: Record<string, string> = {
  'pocomemo/privacy/ja.html': '679966d6d3ad8b24f29660de5a55313db62aab9dc98c5c092836d23e5856f4aa',
  'pocomemo/terms/ja.html': 'cea62bc0e30513f41d104eb882d2cb192a36f4178153d3a6af673f2500fe1938',
  'app-ads.txt': 'a6c6fea7646937264e5449f467c1b4d1f1817888900750cc360d7916ff68cce2',
  CNAME: '7a5f0704c6961c15d7577199418f0322e89bdc45994cddf9d663daafbd277031',
};

const REQUIRED = [
  'index.html',
  'business.html',
  'company.html',
  'works.html',
  '404.html',
  'sitemap.xml',
  'robots.txt',
  'site.webmanifest',
  'favicon.ico',
  'apple-touch-icon.png',
  'og/default.png',
];

for (const [file, hash] of Object.entries(PRESERVED)) {
  const path = join(DIST, file);
  if (!existsSync(path)) {
    errors.push(`引き継ぎファイルがありません: ${file}`);
    continue;
  }
  const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (actual !== hash) errors.push(`引き継ぎファイルの内容が変わっています: ${file}`);
}

for (const file of REQUIRED) {
  if (!existsSync(join(DIST, file))) errors.push(`ファイルがありません: ${file}`);
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const htmlFiles = walk(DIST)
  .filter((p) => p.endsWith('.html'))
  .map((p) => relative(DIST, p))
  .filter((p) => !p.startsWith('pocomemo/'));

const textOf = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<wbr>/g, '')
    .replace(/<[^>]+>/g, ' ');

const idsOf = (html: string) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const pageHtml = new Map(htmlFiles.map((f) => [f, readFileSync(join(DIST, f), 'utf8')]));

// 日本語の文字に挟まれた半角スペース。氏名など意図したものは除外する
const CJK_SPACE = /[぀-ヿ一-鿿][  ][぀-ヿ一-鿿]/g;
const CJK_SPACE_OK = ['折笠 明弘'];

for (const [file, html] of pageHtml) {
  const text = textOf(html);
  if (!allowTodo && /TODO|TBD|要確認|ダミー|lorem ipsum/i.test(text)) {
    errors.push(`${file}: 仮の文字列が残っています`);
  }
  for (const m of text.matchAll(CJK_SPACE)) {
    const around = text.slice(Math.max(0, m.index! - 4), m.index! + 6);
    if (!CJK_SPACE_OK.some((ok) => around.includes(ok))) errors.push(`${file}: 日本語の間に空白があります「${around.trim()}」`);
  }

  // サイト内リンク
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    const url = m[1]!;
    if (url.startsWith('//')) continue;
    const [pathPart, hash] = url.split('#') as [string, string | undefined];
    const clean = pathPart.split('?')[0]!;
    const target = clean === '/' || clean === '' ? 'index.html' : clean.slice(1);
    if (!existsSync(join(DIST, target))) {
      errors.push(`${file}: リンク先がありません ${url}`);
      continue;
    }
    if (hash && target.endsWith('.html')) {
      const targetHtml = pageHtml.get(target);
      if (targetHtml && !idsOf(targetHtml).has(hash)) errors.push(`${file}: アンカーがありません ${url}`);
    }
  }
  // 同じページ内のアンカー
  const ids = idsOf(html);
  for (const m of html.matchAll(/\shref="#([^"]+)"/g)) {
    if (!ids.has(m[1]!)) errors.push(`${file}: ページ内アンカーがありません #${m[1]}`);
  }
}

if (errors.length) {
  console.error(`[check-dist] ${errors.length} 件の問題があります:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[check-dist] OK（${htmlFiles.length} ページ）${allowTodo ? '（ALLOW_TODO=1: TODO の検査を省略）' : ''}`);
