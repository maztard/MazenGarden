import { expect, test } from '@playwright/test';

test('the site shell renders a branded header and primary navigation', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);

  const header = page.locator('.site-header');
  await expect(header).toHaveCount(1);
  await expect(header.getByRole('link', { name: 'MazenGarden' })).toHaveAttribute(
    'href',
    '/MazenGarden/',
  );

  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav).toHaveCount(1);
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/MazenGarden/');
  await expect(nav.getByRole('link', { name: 'Writing' })).toHaveAttribute(
    'href',
    '/MazenGarden/blog/',
  );
  await expect(nav.getByRole('link', { name: 'RSS' })).toHaveAttribute(
    'href',
    '/MazenGarden/rss.xml',
  );
});

test('the homepage marks Home as the current page', async ({ page }) => {
  await page.goto('./');

  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Writing' })).not.toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(nav.getByRole('link', { name: 'RSS' })).not.toHaveAttribute('aria-current', 'page');
});

test('the shell exposes a skip link, a main landmark, and the favicon', async ({ page }) => {
  await page.goto('./');

  await expect(page.locator('main#main')).toHaveCount(1);
  await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main');
  await expect(page.locator('.site-footer')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/MazenGarden/favicon.svg',
  );
});

test('both self-hosted fonts load', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);

  expect(await page.evaluate(() => document.fonts.check('1rem "Dotemp"'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('1rem "Geist Pixel"'))).toBe(true);

  // Astro hashes the generated font-family names, so also check the actual loaded faces.
  const loadedFamilies = await page.evaluate(() =>
    Array.from(document.fonts)
      .filter((font) => font.status === 'loaded')
      .map((font) => font.family),
  );
  expect(loadedFamilies.some((family) => family.startsWith('Dotemp'))).toBe(true);
  expect(loadedFamilies.some((family) => family.startsWith('Geist Pixel'))).toBe(true);
});

test('the shell does not overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});
