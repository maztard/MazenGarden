import { mkdir, stat } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const ARTIFACTS = 'tests/.artifacts';
const CAPTURES = [
  { name: 'desktop-1280.png', width: 1280, height: 900 },
  { name: 'mobile-390.png', width: 390, height: 844 },
  { name: 'mobile-320.png', width: 320, height: 568 },
] as const;

test('capture the homepage at desktop and mobile widths', async ({ page }) => {
  await mkdir(ARTIFACTS, { recursive: true });

  for (const [captureIndex, capture] of CAPTURES.entries()) {
    await page.setViewportSize({ width: capture.width, height: capture.height });

    const response = captureIndex === 0 ? await page.goto('./') : await page.reload();
    expect(response?.status(), `${capture.name} navigation status`).toBe(200);

    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    // Verify key titles render
    const bannerTitle = page.locator('.desktop-banner__title');
    await expect(bannerTitle, `${capture.name} banner title`).toHaveText('PAPI’S ARTISTIC GARDEN');

    const canvasTitle = page.locator('.about-canvas__title');
    await expect(canvasTitle, `${capture.name} canvas title`).toBeVisible();

    // Verify Meet Mazen portrait image loads
    const photo = page.locator('#window-photos img.meet-mazen__image');
    await expect(photo, `${capture.name} portrait image`).toBeVisible();

    await expect
      .poll(() => photo.evaluate((img) => (img as HTMLImageElement).naturalWidth > 0), {
        message: `${capture.name} photo loaded`,
        timeout: 15_000,
      })
      .toBe(true);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const path = `${ARTIFACTS}/${capture.name}`;
    await page.screenshot({ path, fullPage: true });

    const file = await stat(path);
    expect(file.isFile(), `${capture.name} exists`).toBe(true);
    expect(file.size, `${capture.name} byte size`).toBeGreaterThan(0);
  }
});
