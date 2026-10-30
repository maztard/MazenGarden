import { expect, test } from '@playwright/test';

test('homepage responds at the production base path with retro desktop components', async ({
  page,
}) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);

  // Title check
  await expect(page).toHaveTitle(/Mazen Ragab/);

  // Banner and Canvas headings
  await expect(page.locator('.desktop-banner__title')).toHaveText('PAPI’S ARTISTIC GARDEN');
  await expect(page.locator('.about-canvas__title')).toContainText('About');
  await expect(page.locator('.about-canvas__title')).toContainText('Me!');

  // Initial windows are visible
  await expect(page.locator('#window-photos')).toBeVisible();
  await expect(page.locator('#window-socials')).toBeVisible();
});

test('canonical blog post route responds and loads in writing window', async ({ page }) => {
  const response = await page.goto('blog/hello-world/');
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/Hello, world/);
  await expect(page.locator('#window-writing')).toBeVisible();
  await expect(page.locator('[data-writing-post="hello-world"]')).toBeVisible();
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
