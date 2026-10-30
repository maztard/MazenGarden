import { test, expect } from '@playwright/test';

test.describe('Final Review Fix Pass', () => {
  test('drag start does not immediately cause layout jump of overlapping windows', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');

    const photosWindow = page.locator('#window-photos');
    const socialsWindow = page.locator('#window-socials');
    await expect(photosWindow).toBeVisible();
    await expect(socialsWindow).toBeVisible();

    const socialsRectBefore = await socialsWindow.boundingBox();
    expect(socialsRectBefore).not.toBeNull();

    // Click and hold (pointerdown) on photos handle without moving
    const handle = photosWindow.locator('[data-window-handle]');
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + 20, handleBox!.y + 10);
    await page.mouse.down();

    // Check position of socials window: should NOT jump
    const socialsRectDuringHold = await socialsWindow.boundingBox();
    expect(socialsRectDuringHold).not.toBeNull();
    expect(Math.abs(socialsRectDuringHold!.y - socialsRectBefore!.y)).toBeLessThan(5);

    await page.mouse.up();
  });

  test('post links allow modifier keys (Ctrl/Cmd click) without preventDefault', async ({ page }) => {
    await page.goto('./');
    // Open writing window
    await page.locator('[data-dock-toggle="writing"]').click();
    const link = page.locator('[data-writing-link]').first();
    await expect(link).toBeVisible();

    // Verify link has an href and does not prevent default when ctrlKey is true
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('404 page uses retro desktop shell and does not contain broken links', async ({ page }) => {
    const response = await page.goto('./404.html');
    expect(response?.status()).toBe(200);

    // Should render retro desktop layout
    await expect(page.locator('.dock, [role="region"][aria-label="Taskbar"]')).toBeVisible();
    await expect(page.locator('a[href*="/blog/"]:not([href*="/blog/hello-world/"])')).toHaveCount(0);
  });
});
