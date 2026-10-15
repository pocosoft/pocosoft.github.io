# pocosoft.github.io

株式会社ポコソフトの公式サイト（https://www.pocosoft.jp/）。

[Astro](https://astro.build/) で静的に生成し、GitHub Actions から GitHub Pages に公開しています。

## 開発

Node.js 24 以上を使います（`.nvmrc`）。

```bash
npm ci
npm run dev        # http://localhost:4321
```

## 構成

| 場所 | 内容 |
| --- | --- |
| `src/pages/` | ページ（`index` / `business` / `company` / `404` / `sitemap.xml`） |
| `src/data/` | 文言・会社情報・実績・数値などのデータ |
| `src/components/` | 部品（`home/` `business/` `company/` `chrome/` `ui/` `head/`） |
| `src/styles/` | デザイントークン（`tokens.css`）と共通スタイル |
| `src/scripts/` | 動き（出現演出、ヒーローのネットワーク、GSAP によるスクロール演出） |
| `public/` | そのまま配信するファイル |
| `scripts/` | ビルド前後の検査、OGP 画像の生成 |
| `tests/` | Playwright のテスト |

旧 URL は維持しています。`/works.html` は `/business.html#works` へ転送します（`astro.config.mjs` の `redirects`）。

`public/pocomemo/`・`public/app-ads.txt`・`public/CNAME` はアプリストアや AdMob から参照されているため、内容を変えないでください。ビルド後の検査（`scripts/check-dist.ts`）でハッシュを照合しています。

## 実績の数値を更新する

数値は `src/data/metrics.ts` にだけ書きます。`'TODO'` が残っていると `npm run build` が失敗します。

数値が入っていない状態で見た目を確認したいときは、次を使います。

```bash
npm run build:preview   # ALLOW_TODO=1 でビルド
npm run preview
```

SES の実績（`src/data/works.ts`）は、案件が特定できないよう業種と役割だけを書きます。取引先の業態・ツール名・数値は書きません。

## テスト

```bash
npm run check          # 型チェック
npm run build          # ビルドと前後の検査
npm run validate:html
npm run test:e2e       # Playwright（320px〜3840px の9サイズ、横はみ出し・14px 未満の文字・アクセシビリティ・旧 URL）
```

初回は `npx playwright install chromium webkit firefox` でブラウザを入れてください。

## 公開

`main` に push すると、GitHub Actions（`.github/workflows/deploy.yml`）がビルドとテストを行い、通れば GitHub Pages に公開します。プルリクエストではビルドとテストだけを行います。

GitHub Pages の公開元は「GitHub Actions」にしておく必要があります。

```bash
gh api repos/pocosoft/pocosoft.github.io/pages --jq '{build_type, cname, https_enforced}'
```

### 元に戻す

1. 問題のあるコミットを `git revert` して `main` に push する。
2. Jekyll 時代のサイトに戻す場合は、`legacy-jekyll-final` タグの内容に戻したうえで、公開元を legacy（`main` の `/`）に戻す。

```bash
gh api --method PUT repos/pocosoft/pocosoft.github.io/pages -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/'
```

## OGP 画像

デザインを変えたときは `npm run og` で `public/og/default.png` を作り直してコミットします。
