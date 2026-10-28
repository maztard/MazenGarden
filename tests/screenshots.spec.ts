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

    // The first capture navigates; the remaining captures reload for the new viewport.
    const response = captureIndex === 0 ? await page.goto('./') : await page.reload();
    expect(response?.status(), `${capture.name} navigation status`).toBe(200);

    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const heading = page.locator('h1');
    await expect(heading, `${capture.name} h1 count`).toHaveCount(1);
    const headingText = await heading.evaluate((element) =>
      (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
    );
    expect(headingText, `${capture.name} h1 text`).toBe('About Me!');

    const images = page.locator('#pics img');
    const imageCount = await images.count();
    expect(imageCount, `${capture.name} image count`).toBe(4);

    // Trigger native lazy loading by scrolling every card image into view.
    for (let index = 0; index < imageCount; index += 1) {
      await images.nth(index).scrollIntoViewIfNeeded();
    }

    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Array.from(document.querySelectorAll<HTMLImageElement>('#pics img'))
              .filter((image) => !image.complete || image.naturalWidth === 0)
              .map((image) => image.currentSrc || image.src),
          ),
        { message: `${capture.name} images that failed to load`, timeout: 15_000 },
      )
      .toEqual([]);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const path = `${ARTIFACTS}/${capture.name}`;
    await page.screenshot({ path, fullPage: true });

    const file = await stat(path);
    expect(file.isFile(), `${capture.name} exists`).toBe(true);
    expect(file.size, `${capture.name} byte size`).toBeGreaterThan(0);
  }
});
