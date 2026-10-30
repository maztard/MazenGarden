import { expect, test } from '@playwright/test';

test.describe('Retro Desktop Shell', () => {
  test('the shell exposes a skip link, a main landmark, and the favicon', async ({ page }) => {
    const response = await page.goto('./');
    expect(response?.status()).toBe(200);

    // Skip link points to #main
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main');

    // Main landmark is desktop stage
    const main = page.locator('main#main');
    await expect(main).toHaveCount(1);
    await expect(main).toHaveClass(/desktop-stage/);

    // Favicon link is present
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      'href',
      '/MazenGarden/favicon.svg',
    );
  });

  test('the desktop shell renders the landscape banner and the Win95 dock', async ({ page }) => {
    await page.goto('./');

    // Desktop banner
    const banner = page.locator('.desktop-banner');
    await expect(banner).toBeVisible();

    // Dock container
    const dock = page.locator('.dock');
    await expect(dock).toBeVisible();
    await expect(dock).toHaveAttribute('aria-label', 'Taskbar');

    // Start button
    const startBtn = dock.locator('.dock__start');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toContainText('Start');

    // 5 app dock toggle buttons
    const expectedApps = ['photos', 'socials', 'projects', 'writing', 'rss'];
    for (const appId of expectedApps) {
      const btn = dock.locator(`[data-dock-toggle="${appId}"]`);
      await expect(btn).toBeVisible();
    }

    // Live clock in system tray
    const clock = dock.locator('[data-dock-clock]');
    await expect(clock).toBeVisible();
    const clockText = (await clock.textContent())?.trim();
    expect(clockText).toMatch(/^\d{2}:\d{2}$/);
    expect(await clock.getAttribute('title')).toBeTruthy();
  });

  test('dock toggle buttons control window visibility and active styling', async ({ page }) => {
    await page.goto('./');

    const projectsWin = page.locator('#window-projects');
    const projectsBtn = page.locator('[data-dock-toggle="projects"]');

    // Initial state: projects closed
    await expect(projectsWin).toHaveAttribute('hidden');
    await expect(projectsBtn).not.toHaveClass(/dock-button--active/);

    // Toggle open
    await projectsBtn.click();
    await expect(projectsWin).not.toHaveAttribute('hidden');
    await expect(projectsBtn).toHaveClass(/dock-button--active/);

    // Toggle close (since it is topmost)
    await projectsBtn.click();
    await expect(projectsWin).toHaveAttribute('hidden');
    await expect(projectsBtn).not.toHaveClass(/dock-button--active/);
  });

  test('both self-hosted fonts load', async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);

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
});
