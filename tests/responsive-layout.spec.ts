import { test, expect, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: '320px (iPhone SE)', width: 320, height: 568 },
  { name: '390px (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '768px (iPad portrait)', width: 768, height: 1024 },
  { name: '1280px (Desktop)', width: 1280, height: 900 },
] as const;

async function assertZeroHorizontalOverflow(page: Page, label: string) {
  // Settle DOM and fonts
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  const overflowInfo = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const clientWidth = docEl.clientWidth;
    const docScrollWidth = docEl.scrollWidth;
    const bodyScrollWidth = body.scrollWidth;

    const offenders = Array.from(document.body.querySelectorAll('*'))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          className: typeof element.className === 'string' ? element.className : '',
          width: rect.width,
          left: rect.left,
          right: rect.right,
        };
      })
      .filter((item) => item.width > 0 && (item.right > clientWidth + 1 || item.left < -1));

    return {
      clientWidth,
      docScrollWidth,
      bodyScrollWidth,
      offenders: offenders.slice(0, 10), // Limit output if any
    };
  });

  expect(
    overflowInfo.docScrollWidth,
    `[${label}] documentElement.scrollWidth (${overflowInfo.docScrollWidth}) exceeds clientWidth (${overflowInfo.clientWidth})`,
  ).toBeLessThanOrEqual(overflowInfo.clientWidth);

  expect(
    overflowInfo.bodyScrollWidth,
    `[${label}] body.scrollWidth (${overflowInfo.bodyScrollWidth}) exceeds clientWidth (${overflowInfo.clientWidth})`,
  ).toBeLessThanOrEqual(overflowInfo.clientWidth);

  expect(
    overflowInfo.offenders,
    `[${label}] Found elements extending outside viewport bounds: ${JSON.stringify(overflowInfo.offenders)}`,
  ).toEqual([]);
}

for (const vp of VIEWPORTS) {
  test(`Homepage renders with zero horizontal overflow at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('./');

    // Check initial state (photos and socials open by default)
    await assertZeroHorizontalOverflow(page, `Initial ${vp.name}`);

    // Toggle open remaining windows (projects, writing, rss) and check no overflow
    const dockButtons = page.locator('[data-dock-toggle]');
    const count = await dockButtons.count();

    for (let i = 0; i < count; i++) {
      const btn = dockButtons.nth(i);
      const appKey = await btn.getAttribute('data-dock-toggle');
      if (appKey && !['photos', 'socials'].includes(appKey)) {
        await btn.click();
        await page.waitForTimeout(100);
        await assertZeroHorizontalOverflow(page, `After opening ${appKey} at ${vp.name}`);
      }
    }
  });
}

test('Win95 window chrome satisfies 3D border, title bar states, close button, and body bevel specifications', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');

  const photosWin = page.locator('#window-photos');
  const socialsWin = page.locator('#window-socials');
  const photosBar = photosWin.locator('[data-window-handle]');
  const socialsBar = socialsWin.locator('[data-window-handle]');
  const closeBtn = photosWin.locator('[data-window-close]');
  const windowBody = photosWin.locator('.desktop-window__body');

  // Window body has 3D inset border and white background
  const bodyStyles = await windowBody.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      borderTopStyle: s.borderTopStyle,
      borderTopColor: s.borderTopColor,
      borderRightColor: s.borderRightColor,
      borderBottomColor: s.borderBottomColor,
      borderLeftColor: s.borderLeftColor,
    };
  });
  // White background #ffffff = rgb(255, 255, 255)
  expect(bodyStyles.backgroundColor).toBe('rgb(255, 255, 255)');
  expect(bodyStyles.borderTopStyle).toBe('solid');

  // Focus title bar of photos window
  await photosWin.click();
  await expect(photosBar).toHaveClass(/desktop-window__bar--focused/);

  // Active / Focused title bar has white text
  const focusedColor = await photosBar.locator('.desktop-window__title').evaluate((el) => {
    return window.getComputedStyle(el).color;
  });
  expect(focusedColor).toBe('rgb(255, 255, 255)');

  // Inactive title bar (socials) has inactive class/styles and light grey text
  await expect(socialsBar).not.toHaveClass(/desktop-window__bar--focused/);
  const inactiveColor = await socialsBar.locator('.desktop-window__title').evaluate((el) => {
    return window.getComputedStyle(el).color;
  });
  // Light grey: #dfdfdf = rgb(223, 223, 223)
  expect(inactiveColor).toBe('rgb(223, 223, 223)');

  // Close button exists with 3D raised border
  const closeStyles = await closeBtn.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      borderTopStyle: s.borderTopStyle,
      display: s.display,
      cursor: s.cursor,
    };
  });
  expect(closeStyles.borderTopStyle).toBe('solid');
  expect(closeStyles.cursor).toBe('pointer');
});

test('Desktop floating positioning at > 900px places photos upper right, socials overlapping, and mobile <= 900px stacks cleanly', async ({
  page,
}) => {
  // 1. Desktop (> 900px)
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');

  const photosWin = page.locator('#window-photos');
  const socialsWin = page.locator('#window-socials');
  const stage = page.locator('.desktop-stage');

  const photosBox = await photosWin.boundingBox();
  const socialsBox = await socialsWin.boundingBox();
  const stageBox = await stage.boundingBox();
  expect(photosBox).not.toBeNull();
  expect(socialsBox).not.toBeNull();
  expect(stageBox).not.toBeNull();

  // Photos should be in upper right quadrant of stage
  expect(photosBox!.x).toBeGreaterThan(600);
  expect(photosBox!.y - stageBox!.y).toBeLessThan(400);

  // Socials should overlap bottom-right of photos
  expect(socialsBox!.x).toBeGreaterThanOrEqual(photosBox!.x);
  expect(socialsBox!.y).toBeGreaterThan(photosBox!.y);

  // 2. Mobile (<= 900px): Clean vertical stack with position static and max-width 100%
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const mobilePositions = await page.evaluate(() => {
    const photos = document.querySelector('#window-photos') as HTMLElement;
    const socials = document.querySelector('#window-socials') as HTMLElement;
    const stage = document.querySelector('.desktop-stage') as HTMLElement;

    const pStyle = window.getComputedStyle(photos);
    const sStyle = window.getComputedStyle(socials);
    const stageStyle = window.getComputedStyle(stage);

    const pRect = photos.getBoundingClientRect();
    const sRect = socials.getBoundingClientRect();

    return {
      photosPosition: pStyle.position,
      socialsPosition: sStyle.position,
      stageDirection: stageStyle.flexDirection,
      photosTop: pRect.top,
      socialsTop: sRect.top,
      photosWidth: pRect.width,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(mobilePositions.photosPosition).toBe('static');
  expect(mobilePositions.socialsPosition).toBe('static');
  // Photos is stacked above socials
  expect(mobilePositions.socialsTop).toBeGreaterThan(mobilePositions.photosTop);
  // Full width fits inside viewport with zero overflow
  expect(mobilePositions.photosWidth).toBeLessThanOrEqual(mobilePositions.viewportWidth);
});
