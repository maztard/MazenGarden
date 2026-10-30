import { expect, test } from '@playwright/test';

test.describe('Homepage Retro Desktop', () => {
  test('desktop landscape banner renders with wallpaper, desktop icons, bold title, and system strip', async ({
    page,
  }) => {
    await page.goto('./');

    const banner = page.locator('.desktop-banner');
    await expect(banner).toBeVisible();

    // Retro landscape wallpaper SVG with sky, clouds, hills, and dither pattern
    const wallpaper = banner.locator('.desktop-banner__wallpaper svg');
    await expect(wallpaper).toBeVisible();
    await expect(wallpaper.locator('#db-sky')).toHaveCount(1);
    await expect(wallpaper.locator('#db-cloud')).toHaveCount(1);
    await expect(wallpaper.locator('#db-hill-far')).toHaveCount(1);
    await expect(wallpaper.locator('#db-hill-near')).toHaveCount(1);
    await expect(wallpaper.locator('#db-dither')).toHaveCount(1);

    // Desktop icons: My Computer, Folder, Recycle Bin
    const computerIcon = banner.locator('[data-desktop-icon="computer"]');
    const folderIcon = banner.locator('[data-desktop-icon="folder"]');
    const trashIcon = banner.locator('[data-desktop-icon="trash"]');

    await expect(computerIcon).toBeVisible();
    await expect(computerIcon).toContainText('My Computer');

    await expect(folderIcon).toBeVisible();
    await expect(folderIcon).toContainText('Folder');

    await expect(trashIcon).toBeVisible();
    await expect(trashIcon).toContainText('Recycle Bin');

    // Title group
    await expect(banner.locator('.desktop-banner__tag')).toHaveText('PORTFOLIO');
    await expect(banner.locator('.desktop-banner__title')).toHaveText('PAPI’S ARTISTIC GARDEN');
    await expect(banner.locator('.desktop-banner__subtitle')).toHaveText('by Mazen Ragab');

    // Win95 system strip
    const strip = banner.locator('.desktop-banner__system-strip');
    await expect(strip).toBeVisible();
    await expect(strip.locator('.desktop-banner__start-btn')).toBeVisible();
    await expect(strip.locator('.desktop-banner__start-label')).toHaveText('Start');
    await expect(strip.locator('.desktop-banner__path-text')).toHaveText(
      'C:\\MAZEN\\PORTFOLIO.EXE',
    );
    await expect(strip.locator('.desktop-banner__status-cell--ready')).toHaveText('Ready');
  });

  test('static About Me section is on the page canvas (never in an iframe or window)', async ({
    page,
  }) => {
    await page.goto('./');

    const canvas = page.locator('.desktop-canvas-layer .about-canvas');
    await expect(canvas).toBeVisible();

    // Verify canvas is NOT inside an iframe
    const isInIframe = await canvas.evaluate((el) => {
      let current: Node | null = el;
      while (current) {
        if (current.nodeName === 'IFRAME') return true;
        current = current.parentNode;
      }
      return false;
    });
    expect(isInIframe).toBe(false);

    // Verify canvas is NOT inside a desktop window
    const isInWindow = await canvas.evaluate((el) => {
      return Boolean(el.closest('.desktop-window, [data-window]'));
    });
    expect(isInWindow).toBe(false);

    // Title: Dotemp "About Me!"
    const title = canvas.locator('.about-canvas__title');
    await expect(title).toBeVisible();
    await expect(title.locator('.about-canvas__title-line1')).toHaveText('About');
    await expect(title.locator('.about-canvas__title-line2')).toHaveText('Me!');

    // Alias: Mazen Ragab aka (Maztardoo)
    await expect(canvas.locator('.about-canvas__name')).toHaveText(/Mazen Ragab aka \(Maztardoo\)/);

    // Verbatim 5 bio paragraphs
    const bioParagraphs = canvas.locator('.about-canvas__bio p');
    await expect(bioParagraphs).toHaveCount(5);
    await expect(bioParagraphs.nth(0)).toContainText('Hi, you already know my name!');
    await expect(bioParagraphs.nth(1)).toContainText('trying to be a Polymath');
    await expect(bioParagraphs.nth(2)).toContainText(
      'combine knowledge from completely different areas',
    );
    await expect(bioParagraphs.nth(3)).toContainText(
      'taking an idea that sounds stupid at first and trying to turn it into something real',
    );
    await expect(bioParagraphs.nth(4)).toContainText('extremely curious');

    // SKILLS section with badges
    const skillsSection = canvas.locator(
      '.about-canvas__section[aria-labelledby="about-skills-title"]',
    );
    await expect(skillsSection).toBeVisible();
    await expect(skillsSection.locator('#about-skills-title')).toHaveText('SKILLS');

    const badges = skillsSection.locator('.about-canvas__badge');
    await expect(badges).toHaveCount(5);
    await expect(badges).toHaveText(['Tech', 'AI', 'Marketing', 'Psychology', 'Web']);

    // EDUCATION section
    const eduSection = canvas.locator(
      '.about-canvas__section[aria-labelledby="about-education-title"]',
    );
    await expect(eduSection).toBeVisible();
    await expect(eduSection.locator('#about-education-title')).toHaveText('EDUCATION');
    await expect(eduSection.locator('.about-canvas__education')).toHaveText(
      'New Cairo STEM School (G12)',
    );
  });

  test('MEET-MAZEN and SOCIALS windows are open on initial load, others are closed', async ({
    page,
  }) => {
    await page.goto('./');

    const photosWin = page.locator('#window-photos');
    const socialsWin = page.locator('#window-socials');
    const projectsWin = page.locator('#window-projects');
    const writingWin = page.locator('#window-writing');
    const rssWin = page.locator('#window-rss');

    // Photos and Socials are visible/open
    await expect(photosWin).toBeVisible();
    await expect(photosWin).not.toHaveAttribute('hidden');
    await expect(socialsWin).toBeVisible();
    await expect(socialsWin).not.toHaveAttribute('hidden');

    // Others are closed / hidden
    await expect(projectsWin).toBeHidden();
    await expect(projectsWin).toHaveAttribute('hidden');
    await expect(writingWin).toBeHidden();
    await expect(writingWin).toHaveAttribute('hidden');
    await expect(rssWin).toBeHidden();
    await expect(rssWin).toHaveAttribute('hidden');

    // Dock buttons reflect initial state
    await expect(page.locator('[data-dock-toggle="photos"]')).toHaveClass(/dock-button--active/);
    await expect(page.locator('[data-dock-toggle="socials"]')).toHaveClass(/dock-button--active/);
    await expect(page.locator('[data-dock-toggle="projects"]')).not.toHaveClass(
      /dock-button--active/,
    );
    await expect(page.locator('[data-dock-toggle="writing"]')).not.toHaveClass(
      /dock-button--active/,
    );
    await expect(page.locator('[data-dock-toggle="rss"]')).not.toHaveClass(/dock-button--active/);
  });

  test('MEET-MAZEN window displays portrait image inside retro frame', async ({ page }) => {
    await page.goto('./');

    const photosWin = page.locator('#window-photos');
    const img = photosWin.locator('img.meet-mazen__image');

    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('alt', 'Mazen Ragab');

    // Wait for image naturalWidth to be loaded
    await expect
      .poll(async () => {
        return await img.evaluate((image) => (image as HTMLImageElement).naturalWidth);
      })
      .toBeGreaterThan(0);

    // Caption displays Mazen Ragab
    await expect(photosWin.locator('.meet-mazen__caption-text')).toHaveText('Mazen Ragab');
  });

  test('SOCIALS window renders pixel icon social links', async ({ page }) => {
    await page.goto('./');

    const socialsWin = page.locator('#window-socials');
    await expect(socialsWin).toBeVisible();

    const igLink = socialsWin.locator('a[href*="instagram.com"]');
    await expect(igLink).toBeVisible();
    await expect(igLink).toHaveAttribute('href', 'https://www.instagram.com/papisartisticgarden/');
    await expect(igLink).toContainText('@papisartisticgarden');

    const ghLink = socialsWin.locator('a[href*="github.com"]');
    await expect(ghLink).toBeVisible();
    await expect(ghLink).toHaveAttribute('href', 'https://github.com/maztard');
    await expect(ghLink).toContainText('maztard');

    const mailLink = socialsWin.locator('a[href^="mailto:"]');
    await expect(mailLink).toBeVisible();
    await expect(mailLink).toHaveAttribute('href', 'mailto:mazenra100@gmail.com');
    await expect(mailLink).toContainText('mazenra100@gmail.com');
  });

  test('homepage fits at 320px with zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        clientWidth: doc.clientWidth,
        scrollWidth: doc.scrollWidth,
      };
    });

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
});
