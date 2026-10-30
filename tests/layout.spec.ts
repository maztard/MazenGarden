import { expect, test, type Page } from '@playwright/test';

const ORIGIN = 'http://localhost:4321';
const TRACKED_RESOURCE_TYPES = new Set(['document', 'stylesheet', 'script', 'font', 'image']);
const PATHS = ['./', 'blog/hello-world/'] as const;
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
] as const;

interface ObservedResponse {
  resourceType: string;
  pathname: string;
  status: number;
}

function trackSameOriginResponses(page: Page): ObservedResponse[] {
  const observed: ObservedResponse[] = [];

  page.on('response', (response) => {
    const request = response.request();
    if (!TRACKED_RESOURCE_TYPES.has(request.resourceType())) {
      return;
    }

    const url = new URL(response.url());
    if (url.origin !== ORIGIN) {
      return;
    }

    observed.push({
      resourceType: request.resourceType(),
      pathname: url.pathname,
      status: response.status(),
    });
  });

  return observed;
}

async function loadAndSettle(page: Page, path: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const path of PATHS) {
  for (const viewport of VIEWPORTS) {
    test(`${path} fits the viewport at ${viewport.width}px`, async ({ page }) => {
      const responses = trackSameOriginResponses(page);
      await loadAndSettle(page, path, viewport.width, viewport.height);

      const layout = await page.evaluate(() => {
        const documentElement = document.documentElement;
        const clientWidth = documentElement.clientWidth;

        const offenders = Array.from(document.body.querySelectorAll('*'))
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(
            ({ rect }) => rect.width > 0 && (rect.right > clientWidth + 0.5 || rect.left < -0.5),
          )
          .map(({ element, rect }) => ({
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className : '',
            left: Math.round(rect.left * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
          }));

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
          (heading) => ({
            level: Number(heading.tagName.slice(1)),
            text: (heading.textContent ?? '').replace(/\s+/g, ' ').trim(),
          }),
        );

        const imagesWithoutAlt = Array.from(document.querySelectorAll('img'))
          .filter((image) => (image.getAttribute('alt') ?? '').trim() === '')
          .map((image) => image.currentSrc || image.src);

        // Disallow arbitrary template inline styles, excluding desktop window elements managed by window manager
        const inlineStyles = Array.from(
          document.querySelectorAll('[style]:not([data-window])'),
        ).map((element) => element.outerHTML.slice(0, 120));

        const badBasePaths = Array.from(document.querySelectorAll('a[href^="/"]'))
          .map((anchor) => anchor.getAttribute('href') ?? '')
          .filter((href) => !href.startsWith('/MazenGarden/'));

        const bioOverflows = Array.from(document.querySelectorAll('.about-canvas__bio p')).map(
          (paragraph) => ({
            text: (paragraph.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40),
            overflow: paragraph.scrollWidth - paragraph.clientWidth,
          }),
        );

        return {
          scrollWidth: documentElement.scrollWidth,
          clientWidth,
          offenders,
          headings,
          imagesWithoutAlt,
          inlineStyles,
          badBasePaths,
          bioOverflows,
        };
      });

      expect(layout.scrollWidth, 'document scrollWidth').toBeLessThanOrEqual(
        layout.clientWidth + 1,
      );
      expect(layout.offenders, 'elements outside the viewport').toEqual([]);

      expect(
        layout.headings.filter((heading) => heading.level === 1),
        'page level-1 headings',
      ).toHaveLength(2);

      for (let index = 1; index < layout.headings.length; index += 1) {
        const previous = layout.headings[index - 1];
        const current = layout.headings[index];
        expect(
          current.level,
          `h${current.level} "${current.text}" follows h${previous.level} "${previous.text}"`,
        ).toBeLessThanOrEqual(previous.level + 1);
      }

      expect(layout.imagesWithoutAlt, 'images without alt text').toEqual([]);
      expect(layout.inlineStyles, 'inline style attributes').toEqual([]);
      expect(layout.badBasePaths, 'internal links missing the base path').toEqual([]);

      if (path === './') {
        expect(layout.bioOverflows, 'about canvas bio paragraphs').toHaveLength(5);
        for (const paragraph of layout.bioOverflows) {
          expect(
            paragraph.overflow,
            `bio paragraph "${paragraph.text}" overflows horizontally`,
          ).toBeLessThanOrEqual(1);
        }
      }

      await expect
        .poll(
          () =>
            page.evaluate(() =>
              Array.from(document.querySelectorAll('img'))
                .filter((image) => !image.complete || image.naturalWidth === 0)
                .map((image) => image.currentSrc || image.src),
            ),
          { message: 'images that failed to load' },
        )
        .toEqual([]);

      expect(responses.length, 'same-origin responses').toBeGreaterThan(0);
      for (const response of responses) {
        expect(response.pathname, `${response.resourceType} request pathname`).toMatch(
          /^\/MazenGarden\//,
        );
        expect(response.status, `${response.resourceType} ${response.pathname}`).toBeLessThan(400);
      }
    });
  }
}

test('desktop floating layout positions photos upper-right and socials overlapping at 1280px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');

  const photosWin = page.locator('#window-photos');
  const socialsWin = page.locator('#window-socials');

  const photosBox = await photosWin.boundingBox();
  const socialsBox = await socialsWin.boundingBox();
  expect(photosBox).not.toBeNull();
  expect(socialsBox).not.toBeNull();

  // Desktop positioning: photos in right quadrant, socials overlapping
  expect(photosBox!.x).toBeGreaterThan(500);
  expect(socialsBox!.x).toBeGreaterThanOrEqual(photosBox!.x);
  expect(socialsBox!.y).toBeGreaterThan(photosBox!.y);
});

test('mobile layout stacks windows in document flow with position static at 390px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const positions = await page.evaluate(() => {
    const photos = document.querySelector('#window-photos') as HTMLElement;
    const socials = document.querySelector('#window-socials') as HTMLElement;
    const stage = document.querySelector('.desktop-stage') as HTMLElement;

    return {
      photosPosition: window.getComputedStyle(photos).position,
      socialsPosition: window.getComputedStyle(socials).position,
      stageDirection: window.getComputedStyle(stage).flexDirection,
      photosTop: photos.getBoundingClientRect().top,
      socialsTop: socials.getBoundingClientRect().top,
    };
  });

  expect(positions.photosPosition).toBe('static');
  expect(positions.socialsPosition).toBe('static');
  expect(positions.socialsTop).toBeGreaterThan(positions.photosTop);
});
