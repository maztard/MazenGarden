import { expect, test } from '@playwright/test';

const SITE = 'https://maztard.github.io/MazenGarden';
const PAGES = ['./', 'blog/', 'blog/hello-world/', 'does-not-exist/'];

test('rss.xml lists published posts with absolute links', async ({ request }) => {
  const response = await request.get('rss.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');

  const body = await response.text();
  expect(body).toContain(`${SITE}/blog/hello-world/`);
  expect(body).not.toContain('draft-example');
});

test('the sitemap index points at the sitemap', async ({ request }) => {
  const response = await request.get('sitemap-index.xml');
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain(`${SITE}/sitemap-0.xml`);
});

test('the sitemap lists the public pages and excludes drafts and 404', async ({ request }) => {
  const response = await request.get('sitemap-0.xml');
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain(`<loc>${SITE}/</loc>`);
  expect(body).toContain(`<loc>${SITE}/blog/</loc>`);
  expect(body).toContain(`<loc>${SITE}/blog/hello-world/</loc>`);
  expect(body).not.toContain('/404');
  expect(body).not.toContain('draft-example');
});

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const response = await request.get('robots.txt');
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
});

test('the 404 page is noindex and links back home', async ({ page }) => {
  const response = await page.goto('does-not-exist/');
  expect(response?.status()).toBe(404);

  const headings = page.locator('h1');
  await expect(headings).toHaveCount(1);
  await expect(headings).toHaveText('404');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.getByRole('link', { name: '← Back home' })).toHaveAttribute(
    'href',
    '/MazenGarden/',
  );
});

test('each page declares its canonical URL and feed links', async ({ page }) => {
  const canonicals: Record<string, string> = {
    './': `${SITE}/`,
    'blog/': `${SITE}/blog/`,
    'blog/hello-world/': `${SITE}/blog/hello-world/`,
  };

  for (const [path, canonical] of Object.entries(canonicals)) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  }

  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
      'href',
      '/MazenGarden/rss.xml',
    );
    await expect(page.locator('link[rel="sitemap"]')).toHaveAttribute(
      'href',
      '/MazenGarden/sitemap-index.xml',
    );
  }
});

test('the built homepage loads no third-party Google fonts', async ({ request }) => {
  const response = await request.get('./');
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).not.toContain('fonts.googleapis.com');
  expect(body).not.toContain('fonts.gstatic.com');
});
