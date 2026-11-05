import { test, expect } from '@chromatic-com/playwright';

test('トップページ', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /About/ })).toBeVisible();
});
