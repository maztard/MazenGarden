import { expect, test } from '@playwright/test';

test.describe('Blog & Writing', () => {
  test('in-window blog reading on homepage allows navigating to post, back to list, and updates URL', async ({
    page,
  }) => {
    await page.goto('./');

    // Open writing window via dock button
    const writingDockBtn = page.locator('[data-dock-toggle="writing"]');
    await writingDockBtn.click();

    const writingWin = page.locator('#window-writing');
    await expect(writingWin).toBeVisible();

    const listView = writingWin.locator('[data-writing-list]');
    const articleView = writingWin.locator('[data-writing-post="hello-world"]');
    const backBtn = writingWin.locator('[data-writing-back]').first();

    // List view is visible initially, article view is hidden
    await expect(listView).toBeVisible();
    await expect(articleView).toBeHidden();

    // Verify published post item
    const postLink = writingWin.locator('[data-writing-link="hello-world"]');
    await expect(postLink).toBeVisible();
    await expect(postLink.locator('.writing-item__title')).toHaveText('Hello, world');
    await expect(postLink.locator('.writing-item__desc')).toHaveText(
      'A first note from the garden.',
    );

    // Click blog post link to read inline
    await postLink.click();

    // Article is visible inline, list is hidden, URL is updated to canonical
    await expect(listView).toBeHidden();
    await expect(articleView).toBeVisible();
    expect(page.url()).toContain('/blog/hello-world/');

    // Article content is rendered
    await expect(articleView.locator('.writing-reader-title')).toHaveText('Hello, world');
    await expect(articleView.locator('.writing-reader-meta time')).toHaveText('October 28, 2026');
    await expect(articleView.locator('.writing-reader-lead')).toHaveText(
      'A first note from the garden.',
    );
    await expect(articleView.locator('.prose')).toContainText(
      'Welcome to my corner of the internet',
    );

    // Click "← Back to articles"
    await backBtn.click();

    // List view is visible again, article is hidden, URL is reset
    await expect(listView).toBeVisible();
    await expect(articleView).toBeHidden();
    expect(page.url()).not.toContain('/blog/hello-world/');
  });

  test('canonical route /blog/[slug]/ renders post directly in writing window with active dock button', async ({
    page,
  }) => {
    const response = await page.goto('blog/hello-world/');
    expect(response?.status()).toBe(200);

    // Title reflects post
    await expect(page).toHaveTitle(/Hello, world/);

    // Canonical link points to the post
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://maztard.github.io/MazenGarden/blog/hello-world/',
    );

    // Writing window is open on initial load
    const writingWin = page.locator('#window-writing');
    await expect(writingWin).toBeVisible();
    await expect(writingWin).not.toHaveAttribute('hidden');

    // Dock toggle for writing is active
    const writingDockBtn = page.locator('[data-dock-toggle="writing"]');
    await expect(writingDockBtn).toHaveClass(/dock-button--active/);

    // Active post reader is visible
    const articleView = writingWin.locator('[data-writing-post="hello-world"]');
    await expect(articleView).toBeVisible();
    await expect(articleView.locator('.writing-reader-title')).toHaveText('Hello, world');
    await expect(articleView.locator('.writing-reader-meta time')).toHaveText('October 28, 2026');
    await expect(articleView.locator('.writing-reader-lead')).toHaveText(
      'A first note from the garden.',
    );
    await expect(articleView.locator('.prose')).toContainText(
      'Welcome to my corner of the internet',
    );

    // Clicking back button switches to list view and resets URL
    const backBtn = writingWin.locator('[data-writing-back]').first();
    await backBtn.click();

    const listView = writingWin.locator('[data-writing-list]');
    await expect(listView).toBeVisible();
    await expect(articleView).toBeHidden();
    expect(page.url()).not.toContain('/blog/hello-world/');
  });

  test('drafts stay out of the production build', async ({ page }) => {
    await page.goto('./');

    // Open writing window
    await page.locator('[data-dock-toggle="writing"]').click();
    await expect(page.locator('#window-writing')).toBeVisible();

    // Verify draft post is not in writing list
    await expect(page.getByText('Draft example')).toHaveCount(0);

    // Navigating directly to draft route returns 404
    const response = await page.goto('blog/draft-example/');
    expect(response?.status()).toBe(404);
  });
});
