import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4000',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'bundle exec jekyll serve --host 127.0.0.1 --port 4000 --disable-disk-cache --no-watch',
    url: 'http://127.0.0.1:4000',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
