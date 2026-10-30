# Hybrid Windows XP + Windows 95 Desktop & Square Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the retro portfolio into a hybrid Windows XP + Windows 95 experience featuring a fullscreen 100vh hero banner with no duplicate taskbar, interactive desktop icons, canvas-anchored draggable windows (no sticky viewport scrolling), a multi-brand personal branding hub in Socials, and interactive square 3D skill applet tiles.

**Architecture:**
- Full-viewport (`100vh` / `100dvh`) hero landing screen in `DesktopBanner.astro` with interactive desktop icons and scroll prompt, with the middle system strip completely removed.
- Container-relative absolute window positioning in `desktop.ts` so windows stay anchored to the canvas when scrolling rather than floating stickily with the viewport.
- Re-architected `SocialsWindow.astro` showcasing Mazen's personal branding across three Instagram identities (`@papisartisticgarden`, `@bigdaddymazen` as main personal brand, and `@thewonderfulworldofmazen`) alongside GitHub and email.
- Interactive 3D square skill tiles in `AboutCanvas.astro` using Windows XP Luna color accents and active press states.

**Tech Stack:** Astro 7, TypeScript, Vanilla CSS, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-hybrid-xp-95-desktop-design.md`

## Global Constraints

- `DesktopBanner` must fill the initial viewport height (`min-height: 100vh; min-height: 100dvh; width: 100%;`).
- Only ONE taskbar exists on the site: the bottom dock (`DesktopDock.astro`). The banner's middle system strip must be removed completely.
- Window dragging must use container-relative absolute coordinates (`position: absolute` inside `.desktop-stage`), never `position: fixed`.
- Mazen's three Instagram accounts must appear in `SocialsWindow.astro`:
  1. `@papisartisticgarden` (The Creative Garden)
  2. `@bigdaddymazen` (Main Personal Brand & Voice — highlighted)
  3. `@thewonderfulworldofmazen` (The Visual World & Photography)
- Skills must be square 3D tiles with distinct XP color accents (Tech: Blue, AI: Purple, Marketing: Orange, Psychology: Red, Web: Teal).
- Zero horizontal overflow across all viewports (320px, 390px, 768px, 1280px).
- 100% passing test suite with `npm run test`.

## Review Focus

1. **Non-sticky window scrolling**: When windows are dragged or open, scrolling down the page scrolls past them naturally without pinning to the viewport.
2. **Desktop icon click handlers**: Clicking "Folder" opens the Projects window; clicking "My Computer" scrolls to the About canvas and focuses Meet Mazen; clicking "Recycle Bin" opens the RSS window.
3. **Banner full-height responsiveness**: Viewport resizing or mobile viewports maintain clean 100vh bounds without horizontal overflow.
4. **Square skill tile interactivity**: Hover and `:active` press states work smoothly without shifting neighboring layout elements.
5. **Multi-brand socials accessibility**: All 3 Instagram profile links have clear brand labels and valid external target/rel attributes.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/components/desktop/DesktopBanner.astro` | Fullscreen 100vh hero banner, wallpaper, interactive desktop icons, scroll explore button, no duplicate system strip |
| `src/components/apps/AboutCanvas.astro` | Square 3D interactive skill tiles replacing circle badges, with vibrant XP colors |
| `src/components/apps/SocialsWindow.astro` | Multi-brand personal branding hub (`@papisartisticgarden`, `@bigdaddymazen` featured, `@thewonderfulworldofmazen`, GitHub, Email) |
| `src/components/desktop/DesktopDock.astro` | XP emerald green `Start` button, Luna blue active accents |
| `src/scripts/desktop.ts` | Container-relative `position: absolute` dragging (no sticky viewport floating), desktop icon click handlers |
| `src/styles/global.css` | XP Luna design tokens, square skill tiles, canvas-anchored window positioning |
| `tests/hybrid-xp.spec.ts` | New comprehensive Playwright test suite for hybrid XP+95 features |
| `tests/*.spec.ts` | Existing tests updated to match the single dock and square skills |

---

### Task 1: Fullscreen Hero Banner & Remove Duplicate Strip

**Files:**
- Modify: `src/components/desktop/DesktopBanner.astro`
- Test: `tests/hybrid-xp.spec.ts`

**Interfaces:**
- Produces: `DesktopBanner.astro` with `[data-hero-action="computer"]`, `[data-hero-action="folder"]`, `[data-hero-action="trash"]`, `[data-scroll-explore]`, and no `.desktop-banner__system-strip`.

- [ ] **Step 1: Write failing test in `tests/hybrid-xp.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Hybrid Windows XP + 95 Desktop', () => {
  test('banner fills full viewport height (100vh) and has no duplicate system strip', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');

    const banner = page.locator('.desktop-banner');
    await expect(banner).toBeVisible();

    const bannerBox = await banner.boundingBox();
    expect(bannerBox).not.toBeNull();
    expect(bannerBox!.height).toBeGreaterThanOrEqual(790);

    // Verify duplicate system strip was removed
    await expect(page.locator('.desktop-banner__system-strip')).toHaveCount(0);
    await expect(page.getByText('C:\\MAZEN\\PORTFOLIO.EXE')).toHaveCount(0);

    // Verify desktop icons have action attributes
    await expect(page.locator('[data-hero-action="computer"]')).toBeVisible();
    await expect(page.locator('[data-hero-action="folder"]')).toBeVisible();
    await expect(page.locator('[data-hero-action="trash"]')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: FAIL because system strip exists and banner is not 100vh.

- [ ] **Step 3: Modify `src/components/desktop/DesktopBanner.astro`**

- Remove `.desktop-banner__system-strip` completely.
- Add `min-height: 100vh; min-height: 100dvh;` to `.desktop-banner`.
- Add `data-hero-action="computer"`, `data-hero-action="folder"`, and `data-hero-action="trash"` to the desktop icons.
- Add explore scroll hint button at bottom of banner with `data-scroll-explore` ("Scroll down to explore ↓").

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/DesktopBanner.astro tests/hybrid-xp.spec.ts
git commit -m "feat: make desktop banner full-viewport height and remove duplicate system strip"
```

---

### Task 2: Interactive Square Skills Tiles in AboutCanvas

**Files:**
- Modify: `src/components/apps/AboutCanvas.astro`
- Modify: `src/styles/global.css`
- Test: `tests/hybrid-xp.spec.ts`

**Interfaces:**
- Produces: `.skills-grid` in `AboutCanvas.astro` containing 5 `.skill-tile` square buttons with XP category badges and specialty tags.

- [ ] **Step 1: Write failing test in `tests/hybrid-xp.spec.ts`**

```ts
test('skills section renders interactive square 3D tiles with XP color accents', async ({ page }) => {
  await page.goto('./');

  const skillsSection = page.locator('#main .about-canvas__section').filter({ hasText: 'SKILLS' });
  await expect(skillsSection).toBeVisible();

  const skillTiles = skillsSection.locator('.skill-tile');
  await expect(skillTiles).toHaveCount(5);

  const categories = ['Tech', 'AI', 'Marketing', 'Psychology', 'Web'];
  for (const cat of categories) {
    const tile = skillTiles.filter({ hasText: cat });
    await expect(tile).toBeVisible();
  }

  // Ensure no circular pills remain
  await expect(skillsSection.locator('.about-canvas__skill-badge')).toHaveCount(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: FAIL (skill-tile count is 0, skill-badge still exists).

- [ ] **Step 3: Update `src/components/apps/AboutCanvas.astro` and `src/styles/global.css`**

- Replace `.about-canvas__skills-list` circular badge markup with `.skills-grid`:
  ```astro
  <div class="skills-grid" role="list">
    <div class="skill-tile skill-tile--tech" role="listitem">
      <div class="skill-tile__header">
        <span class="skill-tile__badge">SYS</span>
        <span class="skill-tile__title">Tech</span>
      </div>
      <span class="skill-tile__desc">Systems & Code</span>
    </div>
    ...
  </div>
  ```
- Style `.skill-tile` as a tactile square 3D card (`aspect-ratio: 1 / 1` or square minimum dimensions) with Win95 bevel border, hover glow, and active depression.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/apps/AboutCanvas.astro src/styles/global.css tests/hybrid-xp.spec.ts
git commit -m "feat: replace circular badges with interactive square 3D skills tiles"
```

---

### Task 3: Personal Branding Hub in SocialsWindow

**Files:**
- Modify: `src/components/apps/SocialsWindow.astro`
- Modify: `src/consts.ts`
- Test: `tests/hybrid-xp.spec.ts`

**Interfaces:**
- Produces: `SocialsWindow.astro` displaying `@papisartisticgarden`, `@bigdaddymazen` (featured main personal brand), and `@thewonderfulworldofmazen`.

- [ ] **Step 1: Write failing test in `tests/hybrid-xp.spec.ts`**

```ts
test('socials window showcases Mazen three Instagram accounts and branding labels', async ({ page }) => {
  await page.goto('./');

  const socialsWin = page.locator('#window-socials');
  await expect(socialsWin).toBeVisible();

  // 1st: @papisartisticgarden
  const papisLink = socialsWin.locator('a[href*="papisartisticgarden"]');
  await expect(papisLink).toBeVisible();

  // Main: @bigdaddymazen
  const bigdaddyLink = socialsWin.locator('a[href*="bigdaddymazen"]');
  await expect(bigdaddyLink).toBeVisible();
  await expect(bigdaddyLink.locator('.social-link__tag')).toContainText(/Main|Personal/i);

  // 3rd: @thewonderfulworldofmazen
  const worldLink = socialsWin.locator('a[href*="thewonderfulworldofmazen"]');
  await expect(worldLink).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: FAIL (`bigdaddymazen` and `thewonderfulworldofmazen` not found).

- [ ] **Step 3: Update `src/consts.ts` and `src/components/apps/SocialsWindow.astro`**

- In `src/consts.ts`, add:
  ```ts
  export const INSTAGRAM_PAPIS_URL = 'https://www.instagram.com/papisartisticgarden/';
  export const INSTAGRAM_MAIN_URL = 'https://www.instagram.com/bigdaddymazen/';
  export const INSTAGRAM_WORLD_URL = 'https://www.instagram.com/thewonderfulworldofmazen/';
  ```
- In `src/components/apps/SocialsWindow.astro`, render all 3 Instagram links with brand tags, highlighting `@bigdaddymazen` as the main personal voice, plus GitHub and email.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/consts.ts src/components/apps/SocialsWindow.astro tests/hybrid-xp.spec.ts
git commit -m "feat: expand socials window with three distinct Instagram branding accounts"
```

---

### Task 4: Hybrid Windows XP (Luna) Design Tokens & Emerald Start Button

**Files:**
- Modify: `src/components/desktop/DesktopDock.astro`
- Modify: `src/styles/global.css`
- Test: `tests/hybrid-xp.spec.ts`

**Interfaces:**
- Produces: Updated styles for `.dock__start` with Windows XP emerald gradient and white text, plus Luna blue gradients on focused window bars.

- [ ] **Step 1: Write failing test in `tests/hybrid-xp.spec.ts`**

```ts
test('Start button has Windows XP emerald green styling and focused title bars use Luna blue gradient', async ({ page }) => {
  await page.goto('./');

  const startBtn = page.locator('.dock__start');
  await expect(startBtn).toBeVisible();

  // Test Start button background style contains emerald / green hues
  const bgStyle = await startBtn.evaluate((el) => window.getComputedStyle(el).backgroundImage);
  expect(bgStyle).toMatch(/gradient/i);

  // Test focused window bar uses Luna blue gradient
  const focusedBar = page.locator('.desktop-window__bar--focused').first();
  await expect(focusedBar).toBeVisible();
  const barBg = await focusedBar.evaluate((el) => window.getComputedStyle(el).backgroundImage);
  expect(barBg).toMatch(/gradient/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: FAIL (Start button uses gray `#c0c0c0` without gradient).

- [ ] **Step 3: Update `src/components/desktop/DesktopDock.astro` and `src/styles/global.css`**

- In `DesktopDock.astro`, update `.dock__start` styling:
  - Green XP gradient: `background: linear-gradient(180deg, #3fa13f 0%, #298229 50%, #1f6b1f 100%);`
  - Text color: `#ffffff` with subtle text shadow.
  - Distinctive curved XP top-left / bottom-left radius.
- In `global.css`, enrich `.desktop-window__bar--focused` with Luna Blue gradient (`#0055ea` to `#2080ea`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/DesktopDock.astro src/styles/global.css tests/hybrid-xp.spec.ts
git commit -m "style: apply Windows XP emerald Start button and Luna blue title bar gradients"
```

---

### Task 5: Canvas-Anchored Window Dragging & Desktop Icon Click Actions

**Files:**
- Modify: `src/scripts/desktop.ts`
- Modify: `src/styles/global.css`
- Test: `tests/hybrid-xp.spec.ts`

**Interfaces:**
- Consumes: `[data-hero-action]`, `[data-scroll-explore]`, `[data-window-handle]`
- Produces: `desktop.ts` implementing `position: absolute` stage-relative window dragging, and click actions for desktop icons.

- [ ] **Step 1: Write failing test in `tests/hybrid-xp.spec.ts`**

```ts
test('dragging uses absolute positioning on the canvas and desktop icons trigger actions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');

  // Test clicking Folder hero icon opens Projects window
  const folderBtn = page.locator('[data-hero-action="folder"]');
  await folderBtn.click();
  const projectsWin = page.locator('#window-projects');
  await expect(projectsWin).toBeVisible();

  // Test dragging a window uses absolute positioning (not fixed)
  const handle = projectsWin.locator('[data-window-handle]');
  const handleBox = await handle.boundingBox();
  expect(handleBox).not.toBeNull();

  await page.mouse.move(handleBox!.x + 20, handleBox!.y + 10);
  await page.mouse.down();
  await page.mouse.move(handleBox!.x + 70, handleBox!.y + 60, { steps: 5 });
  await page.mouse.up();

  const position = await projectsWin.evaluate((el) => window.getComputedStyle(el).position);
  expect(position).toBe('absolute');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: FAIL (position is currently `fixed` and `data-hero-action="folder"` has no click handler).

- [ ] **Step 3: Update `src/scripts/desktop.ts` and `src/styles/global.css`**

- In `global.css`, set `.desktop-stage` to `position: relative;`. Ensure floating windows on desktop default to `position: absolute;`.
- In `desktop.ts`:
  - Calculate dragging coordinates relative to `.desktop-stage`:
    ```ts
    const stage = document.querySelector<HTMLElement>('.desktop-stage') || document.body;
    const stageRect = stage.getBoundingClientRect();
    // left and top relative to stage
    ```
  - Set `win.style.position = 'absolute'`.
  - Wire up `[data-hero-action="computer"]` to scroll to `#about-me` and bring `photos` to front.
  - Wire up `[data-hero-action="folder"]` to open `projects` window and scroll/bring to front.
  - Wire up `[data-hero-action="trash"]` to open `rss` window and scroll/bring to front.
  - Wire up `[data-scroll-explore]` to smooth-scroll down to the desktop stage.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/hybrid-xp.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/scripts/desktop.ts src/styles/global.css tests/hybrid-xp.spec.ts
git commit -m "feat: implement canvas-anchored absolute window dragging and desktop icon actions"
```

---

### Task 6: Comprehensive Test Suite Updates & Final Verification

**Files:**
- Modify: `tests/banner.spec.ts`
- Modify: `tests/home.spec.ts`
- Modify: `tests/dock.spec.ts`
- Modify: `tests/apps.spec.ts`
- Modify: `tests/shell.spec.ts`

- [ ] **Step 1: Update existing tests to reflect new features**
  - Update `tests/banner.spec.ts` to assert full-height hero and absence of system strip.
  - Update `tests/apps.spec.ts` and `tests/home.spec.ts` to assert square skill tiles and the updated 3 Instagram accounts.
  - Update `tests/dock.spec.ts` to assert emerald Start button.
- [ ] **Step 2: Run full verification suite**
  - `npm run check` (0 errors)
  - `npm run format:check`
  - `npm run test` (100% tests pass)
- [ ] **Step 3: Commit**

```bash
git add tests/
git commit -m "test: update test suites for hybrid XP-95 layout, single dock, and square skills"
```
