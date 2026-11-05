https://www.pocosoft.jp/

## ローカル起動

```bash
bundle install
bundle exec jekyll serve
```

## 見た目の変更確認（Playwright / Chromatic）

Node.js と npm、Ruby と Bundler が必要です。

初回は以下を実行します。

```bash
bundle install
npm ci
npx playwright install chromium
```

トップページのテストを実行すると、Jekyll が自動起動し、Chromium でページを開いて Chromatic 用のアーカイブを生成します。
ポート 4000 を使用するため、別途起動している Jekyll があれば停止してください。

```bash
npm run test:e2e
```

テスト成功後、Chromatic のプロジェクトトークンを環境変数に指定してアップロードします。
`ここにトークン` は Chromatic のセットアップ画面の値に置き換えてください。トークンはリポジトリに保存しません。

```bash
CHROMATIC_PROJECT_TOKEN='ここにトークン' npm run chromatic
```

表示されたリンクから Chromatic で結果を確認します。
HTML や CSS を変更した後は、テストとアップロードを順に実行してください。

参考: [Chromatic の Playwright 連携](https://www.chromatic.com/docs/playwright/)

`@chromatic-com/playwright` の間接依存である Storybook は、セキュリティ修正版の 10.6.2 を `overrides` で指定しています。
連携パッケージ側の依存バージョンが修正された際に、この指定を見直してください。
