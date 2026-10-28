import { expect, test } from '@playwright/test';

test('the blog index lists published posts and marks Writing as current', async ({ page }) => {
  const response = await page.goto('blog/');
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle('Writing · MazenGarden');

  const headings = page.locator('h1');
  await expect(headings).toHaveCount(1);
  await expect(headings).toHaveText('Writing');

  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: 'Writing' })).toHaveAttribute('aria-current', 'page');

  const postTitle = page.getByRole('heading', { level: 2, name: 'Hello, world' });
  await expect(postTitle).toHaveCount(1);

  await postTitle.getByRole('link', { name: 'Hello, world' }).click();
  await expect(page).toHaveURL('http://localhost:4321/MazenGarden/blog/hello-world/');
});

test('the post page renders its title, date, lede, body, and back links', async ({ page }) => {
  const response = await page.goto('blog/hello-world/');
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle('Hello, world · MazenGarden');

  const headings = page.locator('h1');
  await expect(headings).toHaveCount(1);
  await expect(headings).toHaveText('Hello, world');

  await expect(page.locator('.post__meta time')).toHaveText('October 28, 2026');
  await expect(page.locator('.post__lede')).toHaveText('A first note from the garden.');
  await expect(page.locator('.prose')).toContainText('Welcome to my corner of the internet');

  const backLinks = page.locator('.post__back');
  await expect(backLinks.first()).toHaveAttribute('href', '/MazenGarden/blog/');
  await expect(backLinks.last()).toHaveAttribute('href', '/MazenGarden/blog/');
});

test('the homepage shows the latest writing', async ({ page }) => {
  await page.goto('./');

  await expect(page.locator('h1')).toHaveCount(1);

  const section = page.locator('section[aria-labelledby="writing-title"]');
  await expect(section).toHaveCount(1);
  await expect(section.getByRole('heading', { level: 2, name: 'Latest writing' })).toHaveCount(1);
  await expect(section.getByRole('heading', { level: 3, name: 'Hello, world' })).toHaveCount(1);
  await expect(section.getByRole('link', { name: 'All posts →' })).toHaveAttribute(
    'href',
    '/MazenGarden/blog/',
  );
});

test('drafts stay out of the production build', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByText('Draft example')).toHaveCount(0);

  await page.goto('blog/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText('Draft example')).toHaveCount(0);

  const response = await page.goto('blog/draft-example/');
  expect(response?.status()).toBe(404);
});
