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

  test('skills section renders interactive square 3D tiles with XP color accents', async ({
    page,
  }) => {
    await page.goto('./');

    const skillsSection = page
      .locator('#main .about-canvas__section')
      .filter({ hasText: 'SKILLS' });
    await expect(skillsSection).toBeVisible();

    const skillTiles = skillsSection.locator('.skill-tile');
    await expect(skillTiles).toHaveCount(5);

    const categories = ['Tech', 'AI', 'Marketing', 'Psychology', 'Web'];
    for (const cat of categories) {
      const tile = skillTiles.filter({ hasText: cat });
      await expect(tile).toBeVisible();
    }

    // Ensure no circular pills remain
    await expect(skillsSection.locator('.about-canvas__badge')).toHaveCount(0);
    await expect(skillsSection.locator('.about-canvas__skill-badge')).toHaveCount(0);
  });

  test('socials window showcases Mazen three Instagram accounts and branding labels', async ({
    page,
  }) => {
    await page.goto('./');

    const socialsWin = page.locator('#window-socials');
    await expect(socialsWin).toBeVisible();

    // 1st: @papisartisticgarden
    const papisLink = socialsWin.locator('a[href*="papisartisticgarden"]');
    await expect(papisLink).toBeVisible();

    // Main: @bigdaddymazen
    const bigdaddyLink = socialsWin.locator('a[href*="bigdaddymazen"]');
    await expect(bigdaddyLink).toBeVisible();
    await expect(bigdaddyLink.locator('.social-link__tag')).toContainText(/Main|Personal/i);

    // 3rd: @thewonderfulworldofmazen
    const worldLink = socialsWin.locator('a[href*="thewonderfulworldofmazen"]');
    await expect(worldLink).toBeVisible();
  });

  test('Start button has Windows XP emerald green styling and focused title bars use Luna blue gradient', async ({
    page,
  }) => {
    await page.goto('./');

    const startBtn = page.locator('.dock__start');
    await expect(startBtn).toBeVisible();

    // Test Start button background style contains emerald / green hues
    const bgStyle = await startBtn.evaluate((el) => window.getComputedStyle(el).backgroundImage);
    expect(bgStyle).toMatch(/gradient/i);

    // Test Start button text color is white
    const colorStyle = await startBtn.evaluate((el) => window.getComputedStyle(el).color);
    expect(colorStyle).toBe('rgb(255, 255, 255)');

    // Test focused window bar uses Luna blue gradient
    const focusedBar = page.locator('.desktop-window__bar--focused').first();
    await expect(focusedBar).toBeVisible();
    const barBg = await focusedBar.evaluate((el) => window.getComputedStyle(el).backgroundImage);
    expect(barBg).toMatch(/gradient/i);
  });
});

