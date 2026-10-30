# Papi’s Artistic Garden — Retro Desktop & Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a blended retro web portfolio inspired by Sophie Van Schil's Behance design and Windows 95:
- Top retro landscape hero banner with desktop icons and system menu strip
- Static About Me section on the page canvas (never in a window, never closes) with skills badges and education
- Interactive floating Win95 window `div`s on the right (no iframes), with `MEET-MAZEN` (photo) and `SOCIALS` open on load
- Interactive `PROJECTS`, `WRITING`, and `RSS` windows toggled via a bottom Win95 taskbar dock with live clock
- Instant in-window blog post reading with `history.pushState` + pre-rendered `/blog/[slug]/` routes for search engine crawlers and RSS subscribers.

**Spec:** `docs/superpowers/specs/2026-10-30-papis-artistic-garden-desktop-design.md` (Approved — 2026-10-30)

---

## File Map

| Path | Responsibility |
|---|---|
| `src/data/apps.ts` | Dock app registry: id, label, icon, windowTitle, defaultOpen |
| `src/data/icons.ts` | 16×16 pixel coordinate icon grids (computer, folder, trash, photos, contact, writing, projects, rss, close) |
| `src/components/desktop/DesktopBanner.astro` | Top retro dithered landscape banner with title, subtitle, and desktop icons |
| `src/components/desktop/DesktopWindow.astro` | Win95 window `div` with handle, title, close `[X]`, and `<slot />` |
| `src/components/desktop/DesktopDock.astro` | Bottom Win95 taskbar with `Start`, app buttons, and clock |
| `src/components/desktop/DockButton.astro` | Single dock button with icon, tooltip, and `data-dock-toggle` |
| `src/components/apps/AboutCanvas.astro` | Static About Me canvas: pixel About/Me!, name, bio, SKILLS badges, EDUCATION |
| `src/components/apps/MeetMazenWindow.astro` | Photo window content: Mazen's portrait photo in retro frame |
| `src/components/apps/SocialsWindow.astro` | Social links window: Instagram, GitHub, email |
| `src/components/apps/ProjectsContent.astro` | Projects showcase: EmadEats Project, BuggyEyes, Sudany |
| `src/components/apps/WritingContent.astro` | Blog list + inline post reader |
| `src/components/apps/RssContent.astro` | RSS feed URL, copy button, subscription info |
| `src/layouts/DesktopLayout.astro` | Document head, fonts, favicon, dock, script |
| `src/pages/index.astro` | Main single-page desktop assembling banner, canvas, and floating windows |
| `src/pages/blog/[slug].astro` | Canonical SEO route pre-opening Writing window for search engines & direct URLs |
| `src/pages/rss.xml.ts` | RSS 2.0 endpoint |
| `src/scripts/desktop.ts` | Client script: drag, stacking, dock toggles, in-window blog viewer, clock |
| `src/styles/global.css` | Complete styling: landscape banner, About canvas, window chrome, dock, responsive stack |
| `tests/*.spec.ts` | Playwright test suite |

---

## Task 1: Update App Registry and Pixel Icon Data

**Files:**
- Edit: `src/data/apps.ts`
- Edit: `src/data/icons.ts`

- [ ] **1a. Update `src/data/apps.ts`:**
Define the 5 floating applications:
```ts
export type AppId = 'photos' | 'socials' | 'projects' | 'writing' | 'rss';

export interface AppDefinition {
  id: AppId;
  label: string;
  icon: string;
  windowTitle: string;
  defaultOpen: boolean;
}

export const apps: AppDefinition[] = [
  { id: 'photos',   label: 'Photos',   icon: 'photos',   windowTitle: 'MEET-MAZEN', defaultOpen: true },
  { id: 'socials',  label: 'Socials',  icon: 'contact',  windowTitle: 'SOCIALS',    defaultOpen: true },
  { id: 'projects', label: 'Projects', icon: 'projects', windowTitle: 'PROJECTS',   defaultOpen: false },
  { id: 'writing',  label: 'Writing',  icon: 'writing',  windowTitle: 'WRITING',    defaultOpen: false },
  { id: 'rss',      label: 'RSS',      icon: 'rss',      windowTitle: 'RSS',        defaultOpen: false },
];
```

- [ ] **1b. Add Desktop Icons in `src/data/icons.ts`:**
Ensure pixel coordinate grids exist for:
- `computer` (My Computer icon for banner)
- `folder` (desktop folder)
- `trash` (recycle bin)
- Existing icons: `photos`, `contact`, `projects`, `writing`, `rss`, `close`, `pin`, `flower`.

- [ ] **1c. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: update app registry and desktop icon grids`

---

## Task 2: Retro Landscape Banner Component

**Files:**
- Create: `src/components/desktop/DesktopBanner.astro`

- [ ] **2a. Implement `src/components/desktop/DesktopBanner.astro`:**
- Top dithered retro landscape background (grassy green hill under blue sky with cloud gradient).
- Top-left desktop icons row: My Computer, Folder, Recycle Bin with pixel text labels.
- Centered bold title: `PORTFOLIO` / `PAPI’S ARTISTIC GARDEN` with subtitle `by Mazen Ragab`.
- Bottom Win95 system strip: `Start` button on left, path `C:\MAZEN\PORTFOLIO.EXE`, status details.

- [ ] **2b. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: add DesktopBanner retro landscape component`

---

## Task 3: Pure Slot-Based DesktopWindow Component (No Iframes)

**Files:**
- Rewrite: `src/components/desktop/DesktopWindow.astro`

- [ ] **3a. Implement slot-based `DesktopWindow.astro`:**
```astro
---
import PixelIcon from '../ui/PixelIcon.astro';

interface Props {
  windowId: string;
  windowTitle: string;
  icon?: string;
  isOpen?: boolean;
  class?: string;
  style?: string;
}

const {
  windowId,
  windowTitle,
  icon,
  isOpen = false,
  class: className,
  style,
} = Astro.props;
---

<div
  class:list={['desktop-window', className]}
  data-window={windowId}
  id={`window-${windowId}`}
  hidden={!isOpen}
  style={style}
  role="dialog"
  aria-labelledby={`title-${windowId}`}
>
  <div class="desktop-window__bar" data-window-handle>
    {icon && <PixelIcon name={icon} size={16} />}
    <span class="desktop-window__title" id={`title-${windowId}`}>
      {windowTitle}
    </span>
    <button
      class="desktop-window__close"
      type="button"
      data-window-close
      aria-label={`Close ${windowTitle}`}
    >
      <PixelIcon name="close" size={12} />
    </button>
  </div>
  <div class="desktop-window__body">
    <slot />
  </div>
</div>
```

- [ ] **3b. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: implement slot-based DesktopWindow component`

---

## Task 4: Static About Canvas & Window Content Components

**Files:**
- Create: `src/components/apps/AboutCanvas.astro`
- Create: `src/components/apps/MeetMazenWindow.astro`
- Create: `src/components/apps/SocialsWindow.astro`
- Create: `src/components/apps/ProjectsContent.astro`
- Create: `src/components/apps/WritingContent.astro`
- Create: `src/components/apps/RssContent.astro`

- [ ] **4a. Create `src/components/apps/AboutCanvas.astro`:**
Matching the Behance reference layout:
- Giant pixel `about` on line 1, offset red `me!` on line 2.
- `Mazen Ragab aka (Maztardoo)` in italic/bold accent serif.
- The 5 bio paragraphs verbatim.
- **SKILLS** section: circular retro badges for Tech, AI, Marketing, Psychology, Web.
- **EDUCATION** section: `New Cairo STEM School (G12)`.

- [ ] **4b. Create `src/components/apps/MeetMazenWindow.astro`:**
Displays Mazen's photo (`src/assets/images/me/mazen-1.jpeg`) in a retro window frame with caption/alt text.

- [ ] **4c. Create `src/components/apps/SocialsWindow.astro`:**
Floating window content with pixel icon links:
- Instagram: `@papisartisticgarden`
- GitHub: `maztard`
- Email: `mazenra100@gmail.com`

- [ ] **4d. Create `src/components/apps/ProjectsContent.astro`:**
Showcases EmadEats Project (external link), BuggyEyes, and Sudany in a retro browser frame with address bar.

- [ ] **4e. Create `src/components/apps/WritingContent.astro`:**
Displays published post list. When a post is clicked, displays the article inline with a "← Back to articles" button.

- [ ] **4f. Create `src/components/apps/RssContent.astro`:**
Shows RSS feed URL with one-click copy button and feed instructions.

- [ ] **4g. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: add AboutCanvas and window content components`

---

## Task 5: Bottom Dock & Window Toggling

**Files:**
- Edit: `src/components/desktop/DesktopDock.astro`
- Edit: `src/components/desktop/DockButton.astro`

- [ ] **5a. Update `DesktopDock.astro`:**
- Fixed at bottom-center.
- Classic Win95 `Start` button on the left.
- 5 app buttons: Photos (`MEET-MAZEN`), Socials (`SOCIALS`), Projects, Writing, RSS.
- Live clock on the right with full localized date label.
- Buttons use `data-dock-toggle="photos"`, etc.

- [ ] **5b. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: update dock for in-page window toggling`

---

## Task 6: Single-Page Desktop Assembly & Blog SEO Route

**Files:**
- Rewrite: `src/pages/index.astro`
- Rewrite: `src/pages/blog/[slug].astro`
- Delete: `src/pages/apps/` (remove all iframe subpages)
- Delete: `src/pages/photos/index.astro`, `src/pages/projects/index.astro`, `src/pages/contact/index.astro`, `src/pages/rss/index.astro`, `src/pages/blog/index.astro`

- [ ] **6a. Rewrite `src/pages/index.astro`:**
Assembles the complete desktop on `/`:
1. `DesktopBanner` across the top.
2. Main desktop area:
   - Left side: `<AboutCanvas />` static base layer.
   - Right side: `<DesktopWindow windowId="photos">` + `<DesktopWindow windowId="socials">` (open on load), plus hidden windows for projects, writing, rss.
3. `DesktopDock` fixed at bottom.

- [ ] **6b. Rewrite `src/pages/blog/[slug].astro`:**
Pre-renders each post for search engines and direct URLs. Renders the exact same desktop with the Writing window pre-opened displaying the specific article's server-rendered HTML.

- [ ] **6c. Remove obsolete iframe routes:**
Delete `src/pages/apps/` and single-app routes.

- [ ] **6d. Verify:** `npm run build` succeeds and produces static routes without errors.
- [ ] **Commit:** `feat: assemble single-page retro desktop and canonical blog route`

---

## Task 7: Client Script Updates (`src/scripts/desktop.ts`)

**Files:**
- Rewrite: `src/scripts/desktop.ts`

- [ ] **7a. Implement in-page window manager:**
- Window dragging on `[data-window-handle]` with boundary clamping.
- Click-to-front z-index stacking.
- Close button handling: hides window on `[data-window-close]`.
- Dock toggle buttons: clicking a dock button toggles `hidden` attribute and brings window forward.
- In-window blog reader: clicking post links displays the article and updates `history.pushState(null, '', postUrl)`. Clicking "← Back" returns to the post list and resets URL.
- 24h clock update every 15s.

- [ ] **7b. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: implement client script for window dragging, dock toggling, and in-window blog reader`

---

## Task 8: CSS for Landscape Banner, About Canvas & Windows

**Files:**
- Rewrite: `src/styles/global.css`

- [ ] **8a. Implement styles matching Behance reference:**
- Top landscape banner: pixel gradient/dithered hills, clouds, retro typography, desktop icons.
- About canvas: giant pixel "About", offset "Me!", bold serif name, circular skills badges, underlined section titles.
- Win95 window chrome: 3D raised bevels, navy title bar, close `[X]` button, white body.
- Floating positioning: `MEET-MAZEN` upper right, `SOCIALS` overlapping bottom-right.
- Fixed bottom Win95 taskbar dock with drop shadow.
- Mobile responsive (`@media (max-width: 900px)`): clean vertical stack above the dock.

- [ ] **8b. Verify:** `npm run build` succeeds and layout renders cleanly at 320px, 390px, 768px, and 1280px without horizontal overflow.
- [ ] **Commit:** `style: style retro landscape banner, About canvas, and floating windows`

---

## Task 9: Playwright Test Suite Rewrite

**Files:**
- Rewrite: `tests/*.spec.ts`

- [ ] **9a. Update test suite:**
- Assert desktop landscape banner renders.
- Assert About section is on the page canvas (not in an iframe or window).
- Assert `MEET-MAZEN` and `SOCIALS` windows are open on initial load.
- Assert dock toggles windows open/closed.
- Assert window dragging and z-index elevation.
- Assert in-window post reading and `/blog/[slug]/` canonical route.
- Assert zero horizontal overflow from 320px to 1280px.

- [ ] **9b. Run test suite:** `npm run test` passes 100%.
- [ ] **Commit:** `test: rewrite Playwright suite for single-page desktop`

---

## Task 10: Final Quality Verification Gate

- [ ] **10a. Run:**
  - `npm run check` (0 errors)
  - `npm run format`
  - `npm run format:check`
  - `npm run build`
  - `npm run test:e2e`
- [ ] **Commit:** `chore: final verification for single-page retro desktop`
