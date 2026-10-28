import { expect, test } from '@playwright/test';

test('homepage responds at the production base path', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Mazen Ragab/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('MazenGarden');
});

test('the built page has no Google Fonts requests', async ({ page }) => {
  const googleRequests: string[] = [];
  page.on('request', (request) => {
    const host = new URL(request.url()).hostname;
    if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') {
      googleRequests.push(request.url());
    }
  });

  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);

  expect(googleRequests).toEqual([]);
});
