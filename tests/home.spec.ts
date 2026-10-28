import { expect, test } from '@playwright/test';

const CARD_TITLES = [
  'A random sky Image I took',
  'A random sky Image I took',
  'Walking down the dorms',
  'OMG',
];

const CARD_ALTS = [
  'Night sky with a bright moon behind dark leaves',
  'Dark green leaves against a night sky',
  'Lit dormitory hallway with tiled walls and doors',
  'Streetlight glowing over palm leaves at night',
];

test('the homepage hero introduces Mazen with five bio paragraphs', async ({ page }) => {
  await page.goto('./');

  const headings = page.locator('h1');
  await expect(headings).toHaveCount(1);

  const headingText = await headings.evaluate((heading) =>
    (heading.textContent ?? '').replace(/\s+/g, ' ').trim(),
  );
  expect(headingText).toBe('About Me!');

  await expect(page.locator('.hero__name')).toHaveText(/Mazen Ragab aka \(Maztardoo\)/);

  const bioParagraphs = page.locator('.hero__bio p');
  await expect(bioParagraphs).toHaveCount(5);
  await expect(bioParagraphs.first()).toContainText('Hi, you already know my name!');
  await expect(bioParagraphs.last()).toContainText('extremely curious');
});

test('the photo section shows four cards with their copy, alt text, and link', async ({ page }) => {
  await page.goto('./');

  await expect(page.locator('.card')).toHaveCount(4);
  await expect(page.locator('.card__title')).toHaveText(CARD_TITLES);

  const alts = await page
    .locator('.card__image')
    .evaluateAll((images) => images.map((image) => image.getAttribute('alt')));
  expect(alts).toEqual(CARD_ALTS);

  await expect(
    page.locator('.card').nth(1).getByRole('link', { name: '@papisartisticgarden' }),
  ).toHaveAttribute('href', 'https://www.instagram.com/papisartisticgarden/');
});

test('all four card images load', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await expect
    .poll(() =>
      page
        .locator('.card__image')
        .evaluateAll((images) =>
          images.map((image) => (image as HTMLImageElement).naturalWidth > 0),
        ),
    )
    .toEqual([true, true, true, true]);
});

test('the photo cards sit in one row on desktop and one column on mobile', async ({ page }) => {
  const cardTops = () =>
    page
      .locator('.card')
      .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().top)));

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');
  await expect.poll(async () => new Set(await cardTops()).size).toBe(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => new Set(await cardTops()).size).toBe(4);
});

test('the hero copy does not overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');

  const widths = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bioOverflow: Array.from(document.querySelectorAll('.hero__bio p')).map(
      (paragraph) => paragraph.scrollWidth - paragraph.clientWidth,
    ),
  }));

  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1);
  expect(widths.bioOverflow).toHaveLength(5);
  for (const overflow of widths.bioOverflow) {
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
