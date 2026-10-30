import { expect, test } from '@playwright/test';

test.describe('Projects Window', () => {
  test('projects window opens via dock toggle and displays retro browser chrome with projects', async ({
    page,
  }) => {
    await page.goto('./');

    const projectsWin = page.locator('#window-projects');
    const projectsDockBtn = page.locator('[data-dock-toggle="projects"]');

    // Initially closed
    await expect(projectsWin).toBeHidden();
    await expect(projectsWin).toHaveAttribute('hidden');
    await expect(projectsDockBtn).not.toHaveClass(/dock-button--active/);

    // Click dock button to open
    await projectsDockBtn.click();
    await expect(projectsWin).toBeVisible();
    await expect(projectsWin).not.toHaveAttribute('hidden');
    await expect(projectsDockBtn).toHaveClass(/dock-button--active/);

    // Retro browser chrome address bar
    await expect(projectsWin.locator('.projects-browser__address-url')).toHaveText(
      'https://portfolio.local/projects',
    );

    // Heading
    await expect(projectsWin.locator('.projects-browser__heading')).toHaveText('Projects & Works');

    // EmadEats link
    const emadLink = projectsWin.getByRole('link', { name: 'EmadEats Project' });
    await expect(emadLink).toHaveAttribute('href', 'https://emadeats.vercel.app');
    await expect(emadLink).toHaveAttribute('target', '_blank');

    // BuggyEyes and Sudany entries
    const text = await projectsWin.innerText();
    expect(text).toContain('BuggyEyes');
    expect(text).toContain('Sudany');
  });

  test('close button hides projects window and deactivates dock toggle', async ({ page }) => {
    await page.goto('./');

    const projectsWin = page.locator('#window-projects');
    const projectsDockBtn = page.locator('[data-dock-toggle="projects"]');

    // Open projects
    await projectsDockBtn.click();
    await expect(projectsWin).toBeVisible();

    // Click close button in title bar
    const closeBtn = projectsWin.locator('[data-window-close]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Window is hidden and dock button is inactive
    await expect(projectsWin).toBeHidden();
    await expect(projectsWin).toHaveAttribute('hidden');
    await expect(projectsDockBtn).not.toHaveClass(/dock-button--active/);
  });

  test('projects window fits inside a 320px viewport without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('./');

    // Open projects
    await page.locator('[data-dock-toggle="projects"]').click();
    const projectsWin = page.locator('#window-projects');
    await expect(projectsWin).toBeVisible();

    const rect = await projectsWin.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        width: r.width,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    expect(rect.left).toBeGreaterThanOrEqual(-1);
    expect(rect.right).toBeLessThanOrEqual(rect.clientWidth + 1);
  });
});
