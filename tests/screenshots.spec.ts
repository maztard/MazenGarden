import { mkdir } from 'node:fs/promises';
import { test } from '@playwright/test';

const ARTIFACTS = 'tests/.artifacts';

test('capture the homepage at desktop and mobile widths', async ({ page }) => {
  await mkdir(ARTIFACTS, { recursive: true });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: `${ARTIFACTS}/desktop-1280.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: `${ARTIFACTS}/mobile-390.png`, fullPage: true });

  await page.setViewportSize({ width: 320, height: 568 });
  await page.reload();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: `${ARTIFACTS}/mobile-320.png`, fullPage: true });
});
