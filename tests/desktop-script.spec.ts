import { test, expect } from '@playwright/test';

test.describe('Desktop Client Script (desktop.ts)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');
    // Ensure document and desktop window manager have loaded
    await page.waitForLoadState('domcontentloaded');
  });

  test('24h clock displays HH:MM and localized date title/aria-label', async ({ page }) => {
    const clock = page.locator('[data-dock-clock]').first();
    await expect(clock).toBeVisible();

    // Text format must be 24h format (HH:MM)
    const text = (await clock.textContent())?.trim();
    expect(text).toMatch(/^\d{2}:\d{2}$/);

    // Title and aria-label must include date and time
    const title = await clock.getAttribute('title');
    const ariaLabel = await clock.getAttribute('aria-label');
    expect(title).toBeTruthy();
    expect(title).toContain(text!);
    expect(ariaLabel).toBe(title);
  });

  test('Dock toggle buttons open, elevate, and close windows correctly', async ({ page }) => {
    const photosWin = page.locator('#window-photos');
    const socialsWin = page.locator('#window-socials');
    const projectsWin = page.locator('#window-projects');

    const photosDockBtn = page.locator('[data-dock-toggle="photos"]');
    const socialsDockBtn = page.locator('[data-dock-toggle="socials"]');
    const projectsDockBtn = page.locator('[data-dock-toggle="projects"]');

    // Initial state: photos and socials are open, projects is closed
    await expect(photosWin).not.toHaveAttribute('hidden');
    await expect(socialsWin).not.toHaveAttribute('hidden');
    await expect(projectsWin).toHaveAttribute('hidden');

    await expect(photosDockBtn).toHaveClass(/dock-button--active/);
    await expect(socialsDockBtn).toHaveClass(/dock-button--active/);
    await expect(projectsDockBtn).not.toHaveClass(/dock-button--active/);

    // 1. Closed -> Open and bring to front
    await projectsDockBtn.click();
    await expect(projectsWin).not.toHaveAttribute('hidden');
    await expect(projectsDockBtn).toHaveClass(/dock-button--active/);

    const projectsBar = projectsWin.locator('[data-window-handle]');
    await expect(projectsBar).toHaveClass(/desktop-window__bar--focused/);

    const projectsZ = await projectsWin.evaluate((el) => parseInt(el.style.zIndex || '0', 10));
    const photosZ = await photosWin.evaluate((el) => parseInt(el.style.zIndex || '0', 10));
    expect(projectsZ).toBeGreaterThan(photosZ);

    // 2. Open and behind -> Bring to front
    // First, click photos window to bring it to front
    await photosWin.click();
    const photosBar = photosWin.locator('[data-window-handle]');
    await expect(photosBar).toHaveClass(/desktop-window__bar--focused/);
    await expect(projectsBar).not.toHaveClass(/desktop-window__bar--focused/);

    // Now projects is open and behind photos; clicking projects dock button brings it to front
    await projectsDockBtn.click();
    await expect(projectsWin).not.toHaveAttribute('hidden');
    await expect(projectsBar).toHaveClass(/desktop-window__bar--focused/);
    await expect(photosBar).not.toHaveClass(/desktop-window__bar--focused/);

    // 3. Open and topmost -> Close
    // Now projects is topmost; clicking projects dock button closes it
    await projectsDockBtn.click();
    await expect(projectsWin).toHaveAttribute('hidden');
    await expect(projectsDockBtn).not.toHaveClass(/dock-button--active/);
  });

  test('Close button hides window and clears dock-button--active', async ({ page }) => {
    const photosWin = page.locator('#window-photos');
    const photosDockBtn = page.locator('[data-dock-toggle="photos"]');
    const closeBtn = photosWin.locator('[data-window-close]');

    await expect(photosWin).not.toHaveAttribute('hidden');
    await expect(photosDockBtn).toHaveClass(/dock-button--active/);

    await closeBtn.click();

    await expect(photosWin).toHaveAttribute('hidden');
    await expect(photosDockBtn).not.toHaveClass(/dock-button--active/);
  });

  test('Click-to-front and focusin elevates window and focuses title bar', async ({ page }) => {
    const photosWin = page.locator('#window-photos');
    const socialsWin = page.locator('#window-socials');

    const photosBar = photosWin.locator('[data-window-handle]');
    const socialsBar = socialsWin.locator('[data-window-handle]');

    // Click photos window
    await photosWin.click();
    await expect(photosBar).toHaveClass(/desktop-window__bar--focused/);
    await expect(socialsBar).not.toHaveClass(/desktop-window__bar--focused/);

    const photosZ1 = await photosWin.evaluate((el) => parseInt(el.style.zIndex || '0', 10));
    const socialsZ1 = await socialsWin.evaluate((el) => parseInt(el.style.zIndex || '0', 10));
    expect(photosZ1).toBeGreaterThan(socialsZ1);

    // Click socials window
    await socialsWin.click();
    await expect(socialsBar).toHaveClass(/desktop-window__bar--focused/);
    await expect(photosBar).not.toHaveClass(/desktop-window__bar--focused/);

    const photosZ2 = await photosWin.evaluate((el) => parseInt(el.style.zIndex || '0', 10));
    const socialsZ2 = await socialsWin.evaluate((el) => parseInt(el.style.zIndex || '0', 10));
    expect(socialsZ2).toBeGreaterThan(photosZ2);

    // Focusin event on photos window child element elevates photos
    await photosWin.evaluate((win) => {
      win.dispatchEvent(new Event('focusin', { bubbles: true }));
    });
    await expect(photosBar).toHaveClass(/desktop-window__bar--focused/);
    await expect(socialsBar).not.toHaveClass(/desktop-window__bar--focused/);
  });

  test('Window dragging works on desktop with boundary clamping', async ({ page }) => {
    const photosWin = page.locator('#window-photos');
    const handle = photosWin.locator('[data-window-handle]');
    await handle.scrollIntoViewIfNeeded();

    const initialBox = await handle.boundingBox();
    expect(initialBox).not.toBeNull();

    // Drag handle by (+60, +40)
    await page.mouse.move(initialBox!.x + 20, initialBox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(initialBox!.x + 80, initialBox!.y + 50, { steps: 5 });
    await page.mouse.up();

    const movedRect = await photosWin.evaluate((el) => el.getBoundingClientRect());
    expect(movedRect.left).toBeCloseTo(initialBox!.x + 60, -1);

    // Drag towards extreme right (x=2000): should clamp so at least 80px remains on screen
    const handleBox2 = await handle.boundingBox();
    await page.mouse.move(handleBox2!.x + 20, handleBox2!.y + 10);
    await page.mouse.down();
    await page.mouse.move(2500, handleBox2!.y + 10, { steps: 5 });
    await page.mouse.up();

    const rightClamped = await photosWin.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        maxLeft: window.innerWidth - 80,
      };
    });
    expect(rightClamped.left).toBeLessThanOrEqual(rightClamped.maxLeft + 1);

    // Drag towards extreme left (x=-2000): should clamp so at least 80px remains on screen
    const handleBox3 = await handle.boundingBox();
    await page.mouse.move(handleBox3!.x + 20, handleBox3!.y + 10);
    await page.mouse.down();
    await page.mouse.move(-2000, handleBox3!.y + 10, { steps: 5 });
    await page.mouse.up();

    const leftClamped = await photosWin.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        right: rect.right,
      };
    });
    // At least 80px remains on screen on left edge
    expect(leftClamped.right).toBeGreaterThanOrEqual(79);

    // Drag towards bottom: must stay inside stage bounds
    const handleBox4 = await handle.boundingBox();
    await page.mouse.move(handleBox4!.x + 20, handleBox4!.y + 10);
    await page.mouse.down();
    await page.mouse.move(handleBox4!.x + 20, 2000, { steps: 5 });
    await page.mouse.up();

    const bottomClamped = await photosWin.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const stage = document.querySelector('.desktop-stage') || document.body;
      const stageRect = stage.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        stageBottom: stageRect.bottom,
      };
    });
    expect(bottomClamped.bottom).toBeLessThanOrEqual(bottomClamped.stageBottom + 2);

    // Drag towards top: must not go above stage top
    const handleBox5 = await handle.boundingBox();
    await page.mouse.move(handleBox5!.x + 20, handleBox5!.y + 10);
    await page.mouse.down();
    await page.mouse.move(handleBox5!.x + 20, -1000, { steps: 5 });
    await page.mouse.up();

    const topClamped = await photosWin.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const stage = document.querySelector('.desktop-stage') || document.body;
      const stageRect = stage.getBoundingClientRect();
      return rect.top - stageRect.top;
    });
    expect(topClamped).toBeGreaterThanOrEqual(-1);
  });

  test('Dragging is disabled on screens <= 900px', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 700 });
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');

    const photosWin = page.locator('#window-photos');
    const handle = photosWin.locator('[data-window-handle]');

    const initialBox = await handle.boundingBox();
    expect(initialBox).not.toBeNull();

    // Attempt to drag
    await page.mouse.move(initialBox!.x + 20, initialBox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(initialBox!.x + 150, initialBox!.y + 100);
    await page.mouse.up();

    // Style position should NOT be set to 'fixed' by dragging
    const position = await photosWin.evaluate((el) => el.style.position);
    expect(position).not.toBe('fixed');
  });

  test('In-window blog reader handles link click, back button, and popstate', async ({ page }) => {
    // Open writing window via dock button
    const writingDockBtn = page.locator('[data-dock-toggle="writing"]');
    await writingDockBtn.click();

    const writingWin = page.locator('#window-writing');
    await expect(writingWin).toBeVisible();

    const listView = writingWin.locator('[data-writing-list]');
    const articleView = writingWin.locator('[data-writing-post="hello-world"]');
    const backBtn = writingWin.locator('[data-writing-back]').first();

    // List view is visible, article reader is hidden
    await expect(listView).toBeVisible();
    await expect(articleView).toBeHidden();

    // Click blog post link inside writing window
    const postLink = writingWin.locator('[data-writing-link="hello-world"]');
    await expect(postLink).toBeVisible();
    await postLink.click();

    // Inline article is visible, list is hidden, URL is updated
    await expect(listView).toBeHidden();
    await expect(articleView).toBeVisible();
    expect(page.url()).toContain('/blog/hello-world/');

    // Click "← Back to articles"
    await backBtn.click();

    // List view is visible again, article is hidden, URL is reset
    await expect(listView).toBeVisible();
    await expect(articleView).toBeHidden();
    expect(page.url()).not.toContain('/blog/hello-world/');

    // Test popstate: Browser back navigates back to article
    await page.goBack();
    await expect(listView).toBeHidden();
    await expect(articleView).toBeVisible();
    expect(page.url()).toContain('/blog/hello-world/');

    // Browser forward navigates back to list view
    await page.goForward();
    await expect(listView).toBeVisible();
    await expect(articleView).toBeHidden();
    expect(page.url()).not.toContain('/blog/hello-world/');
  });
});
