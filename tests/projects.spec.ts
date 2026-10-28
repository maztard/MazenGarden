import { expect, test } from '@playwright/test';

test('the projects window lists the other projects', async ({ page }) => {
  await page.goto('./');

  const projects = page.locator('#projects');
  await expect(projects).toBeVisible();
  await expect(projects).toContainText('Other Projects');

  await expect(projects.getByRole('link', { name: 'EmadEats Project' })).toHaveAttribute(
    'href',
    'https://emadeats.vercel.app',
  );

  const text = await projects.innerText();
  expect(text).toContain('BuggyEyes');
  expect(text).toContain('Sudany');
  expect(text).not.toContain(']');
});

test('the close button hides the projects window and stays safe on a second click', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('./');

  const projects = page.locator('#projects');
  const closeButton = projects.locator('[data-close]');
  await expect(closeButton).toBeVisible();

  await closeButton.click();
  await expect(projects).toBeHidden();
  expect(await projects.evaluate((section) => (section as HTMLElement).hidden)).toBe(true);

  await closeButton.evaluate((button) => (button as HTMLButtonElement).click());
  expect(await projects.evaluate((section) => (section as HTMLElement).hidden)).toBe(true);
  expect(pageErrors).toEqual([]);
});

test('the projects window fits inside a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');

  const edges = await page.locator('#projects .window').evaluate((window) => {
    const rect = window.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: document.documentElement.clientWidth };
  });

  expect(edges.left).toBeGreaterThanOrEqual(0);
  expect(edges.right).toBeLessThanOrEqual(edges.viewport);
});
