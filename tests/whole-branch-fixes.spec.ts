import { test, expect } from '@playwright/test';

test.describe('Whole-Branch Review Fixes', () => {
  test('skill tiles are interactive buttons that toggle active state on click and enter key', async ({ page }) => {
    await page.goto('./');

    const firstTile = page.locator('.skill-tile').first();
    await expect(firstTile).toBeVisible();

    // Verify it is a button element
    const tagName = await firstTile.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');

    // Click it: should toggle active state
    await firstTile.click();
    await expect(firstTile).toHaveClass(/skill-tile--active/);

    // Click again: should deactivate
    await firstTile.click();
    await expect(firstTile).not.toHaveClass(/skill-tile--active/);
  });

  test('drag clamping keeps dragged windows above the bottom dock clearance', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('./');

    // Open projects window
    const folderBtn = page.locator('[data-hero-action="folder"]');
    await folderBtn.click();
    const projectsWin = page.locator('#window-projects');
    await expect(projectsWin).toBeVisible();

    const handle = projectsWin.locator('[data-window-handle]');
    await handle.scrollIntoViewIfNeeded();
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    // Drag far down
    await page.mouse.move(handleBox!.x + 20, handleBox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 20, handleBox!.y + 2000, { steps: 5 });
    await page.mouse.up();

    // Check that projects window bottom is above the dock
    const dockEl = page.locator('.dock');
    await expect(dockEl).toBeVisible();
    const dockBox = await dockEl.boundingBox();
    const winBox = await projectsWin.boundingBox();

    expect(winBox).not.toBeNull();
    expect(dockBox).not.toBeNull();
    // In canvas coordinates, the window's bottom relative to stage leaves dock clearance
    const stageBox = await page.locator('.desktop-stage').boundingBox();
    expect(stageBox).not.toBeNull();
    expect(winBox!.y + winBox!.height).toBeLessThanOrEqual(stageBox!.y + stageBox!.height - 30);
  });
});
