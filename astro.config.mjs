// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.pocosoft.jp',
  output: 'static',
  // /business.html などの既存 URL を維持する
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  redirects: { '/works': '/business.html#works' },
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
