import { test, expect } from '@playwright/test';

test.describe('Hybrid Windows XP + 95 Desktop', () => {
  test('banner fills full viewport height (100vh) and has no duplicate system strip', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');

    const banner = page.locator('.desktop-banner');
    await expect(banner).toBeVisible();

    const bannerBox = await banner.boundingBox();
    expect(bannerBox).not.toBeNull();
    expect(bannerBox!.height).toBeGreaterThanOrEqual(790);

    // Verify duplicate system strip was removed
    await expect(page.locator('.desktop-banner__system-strip')).toHaveCount(0);
    await expect(page.getByText('C:\\MAZEN\\PORTFOLIO.EXE')).toHaveCount(0);

    // Verify desktop icons have action attributes
    await expect(page.locator('[data-hero-action="computer"]')).toBeVisible();
    await expect(page.locator('[data-hero-action="folder"]')).toBeVisible();
    await expect(page.locator('[data-hero-action="trash"]')).toBeVisible();
  });
});
