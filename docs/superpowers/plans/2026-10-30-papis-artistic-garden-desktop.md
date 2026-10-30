# Papi’s Artistic Garden — Single-Page Retro Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the retro desktop so that the About Me section is hardcoded directly on the background canvas on the left, and all applications (Photos, Socials, Projects, Writing, RSS) are pure HTML `div` windows floating on the right and bottom dock—zero iframes, with instant in-window blog post viewing and server-rendered `/blog/[slug]/` routes for SEO.

**Spec:** `docs/superpowers/specs/2026-10-30-papis-artistic-garden-desktop-design.md` (Approved — 2026-10-30)

---

## File Map

| Path | Responsibility |
|---|---|
| `src/consts.ts` | Site branding, contact email, social URLs |
| `src/data/apps.ts` | Dock app registry (id, label, icon, windowId, defaultOpen) |
| `src/data/photos.ts` | 4 photos with alt text (Mazen + placeholders) |
| `src/data/icons.ts` | 16×16 pixel coordinate icon grids |
| `src/layouts/DesktopLayout.astro` | Full-screen desktop layout, head fonts, favicon, dock, script |
| `src/components/desktop/DesktopWindow.astro` | Win95 window `div` with handle, title, close button, `<slot />` |
| `src/components/desktop/DesktopDock.astro` | Fixed bottom taskbar with app toggle buttons and live clock |
| `src/components/desktop/DockButton.astro` | Single dock button with icon, tooltip, and click-toggle |
| `src/components/apps/AboutCanvas.astro` | Static About Me canvas section (two-line heading, name, 5 bio paragraphs) |
| `src/components/apps/MeetMazenWindow.astro` | Photos content: Mazen's photo and 2×2 grid |
| `src/components/apps/SocialsWindow.astro` | Social links: Instagram, GitHub, email |
| `src/components/apps/ProjectsContent.astro` | Other projects: EmadEats, BuggyEyes, Sudany |
| `src/components/apps/WritingContent.astro` | Blog post list + inline article reader |
| `src/components/apps/RssContent.astro` | RSS feed URL, copy button, subscription info |
| `src/pages/index.astro` | Main single-page desktop with all windows |
| `src/pages/blog/[slug].astro` | Canonical SEO route for direct post links and feed subscribers |
| `src/pages/rss.xml.ts` | RSS 2.0 feed |
| `src/scripts/desktop.ts` | Clock, window drag, click-to-front z-index, dock show/hide, in-window blog reader |
| `src/styles/global.css` | Left About canvas, Win95 window chrome, 3D bevels, dock, responsive stack |
| `tests/*.spec.ts` | Playwright test suite |

---

## Task 1: Update App Registry and Dock Data

**Files:**
- Edit: `src/data/apps.ts`

- [ ] **1a. Define window-based app registry:**
Update `src/data/apps.ts` so that each app defines its corresponding floating window:

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

- [ ] **1b. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: update app registry for single-page desktop windows`

---

## Task 2: Pure Slot-Based DesktopWindow Component (No Iframes)

**Files:**
- Rewrite: `src/components/desktop/DesktopWindow.astro`

- [ ] **2a. Implement slot-based `DesktopWindow.astro`:**
Remove all iframe logic. Every window renders its body directly from `<slot />`:

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

- [ ] **2b. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: simplify DesktopWindow to slot-based container without iframes`

---

## Task 3: Static About Section on Canvas & Window Content Components

**Files:**
- Create: `src/components/apps/AboutCanvas.astro`
- Create: `src/components/apps/MeetMazenWindow.astro`
- Create: `src/components/apps/SocialsWindow.astro`
- Create: `src/components/apps/WritingContent.astro`

- [ ] **3a. Create `src/components/apps/AboutCanvas.astro`:**
Renders the permanent static About section on the page canvas:
- Giant pixel "About" with offset "Me!" line
- Name: "Mazen Ragab aka (Maztardoo)"
- Five bio paragraphs verbatim
- Underlined section headers: "SKILLS", "EDUCATION", "INTERESTS" matching the reference design aesthetic.

- [ ] **3b. Create `src/components/apps/MeetMazenWindow.astro`:**
Renders Mazen's photo and photo grid inside the `MEET-MAZEN` window.

- [ ] **3c. Create `src/components/apps/SocialsWindow.astro`:**
Renders social links (Instagram `@papisartisticgarden`, GitHub `maztard`, email `mazenra100@gmail.com`) with pixel icons.

- [ ] **3d. Create `src/components/apps/WritingContent.astro`:**
Renders the list of articles. When an article is selected, displays the post content inline with a "← Back to articles" button.

- [ ] **3e. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: add AboutCanvas and window content components`

---

## Task 4: Dock & In-Page Window Toggling

**Files:**
- Edit: `src/components/desktop/DesktopDock.astro`
- Edit: `src/components/desktop/DockButton.astro`

- [ ] **4a. Update Dock and Buttons:**
Dock buttons should have `data-dock-toggle="photos"`, `data-dock-toggle="socials"`, etc. Clicking a dock button toggles the matching window `hidden` state or elevates it if already open.

- [ ] **4b. Update live clock:**
Displays 24h local time with localized date label.

- [ ] **4c. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: wire dock buttons for in-page window toggling`

---

## Task 5: Assemble Single-Page Desktop (`index.astro`) and Post Route

**Files:**
- Rewrite: `src/pages/index.astro`
- Rewrite: `src/pages/blog/[slug].astro`
- Delete: `src/pages/apps/` (remove all iframe subpages)
- Delete: `src/pages/photos/index.astro`, `src/pages/projects/index.astro`, `src/pages/contact/index.astro`, `src/pages/rss/index.astro`, `src/pages/blog/index.astro`

- [ ] **5a. Rewrite `src/pages/index.astro`:**
```astro
---
import DesktopLayout from '../layouts/DesktopLayout.astro';
import DesktopWindow from '../components/desktop/DesktopWindow.astro';
import AboutCanvas from '../components/apps/AboutCanvas.astro';
import MeetMazenWindow from '../components/apps/MeetMazenWindow.astro';
import SocialsWindow from '../components/apps/SocialsWindow.astro';
import ProjectsContent from '../components/apps/ProjectsContent.astro';
import WritingContent from '../components/apps/WritingContent.astro';
import RssContent from '../components/apps/RssContent.astro';
import { getPublishedPosts } from '../utils/posts';

const posts = await getPublishedPosts();
---

<DesktopLayout title="Papi’s Artistic Garden">
  <div class="desktop-stage">
    <!-- Static About canvas on the left -->
    <AboutCanvas />

    <!-- Floating Window div elements on the right -->
    <DesktopWindow windowId="photos" windowTitle="MEET-MAZEN" icon="photos" isOpen={true} class="window--photos">
      <MeetMazenWindow />
    </DesktopWindow>

    <DesktopWindow windowId="socials" windowTitle="SOCIALS" icon="contact" isOpen={true} class="window--socials">
      <SocialsWindow />
    </DesktopWindow>

    <DesktopWindow windowId="projects" windowTitle="PROJECTS" icon="projects" isOpen={false} class="window--projects">
      <ProjectsContent />
    </DesktopWindow>

    <DesktopWindow windowId="writing" windowTitle="WRITING" icon="writing" isOpen={false} class="window--writing">
      <WritingContent posts={posts} />
    </DesktopWindow>

    <DesktopWindow windowId="rss" windowTitle="RSS" icon="rss" isOpen={false} class="window--rss">
      <RssContent />
    </DesktopWindow>
  </div>
</DesktopLayout>
```

- [ ] **5b. Rewrite `src/pages/blog/[slug].astro`:**
Renders the exact same desktop, but with the `writing` window pre-opened displaying the specific post server-rendered, for search engines and direct URL links.

- [ ] **5c. Remove obsolete iframe routes:**
Delete `src/pages/apps/` entirely.

- [ ] **5d. Verify:** `npm run build` succeeds cleanly.
- [ ] **Commit:** `feat: assemble single-page desktop with static About canvas and floating windows`

---

## Task 6: Client Script Updates (`desktop.ts`)

**Files:**
- Edit: `src/scripts/desktop.ts`

- [ ] **6a. Wire client script for in-page desktop:**
- Window dragging with pointer capture and screen clamping.
- Click-to-front z-index stacking.
- Dock toggle buttons: clicking a dock button toggles the window's `hidden` attribute and focuses it.
- In-window blog post navigation: clicking a post in Writing swaps to the article view and updates `history.pushState(null, '', postUrl)`. Clicking "← Back" returns to the list and resets the URL.
- Live clock in 24h format.

- [ ] **6b. Verify:** `npm run check` passes.
- [ ] **Commit:** `feat: implement in-page window management and post reading in desktop.ts`

---

## Task 7: CSS for Canvas & Floating Window Positioning

**Files:**
- Edit: `src/styles/global.css`

- [ ] **7a. Style the split desktop layout:**
- `.desktop-stage`: Desktop container displaying `.desktop__about` on the left and floating windows on the right.
- `.desktop__about`: Static About section directly on the desktop canvas with giant pixel "About" and offset "Me!".
- `.window--photos`: Default position on the upper right.
- `.window--socials`: Default position overlapping the bottom-right corner of the photos window.
- Window chrome: Win95 3D bevels, navy title bar, close button.
- Bottom fixed floating dock with taskbar styling.
- Responsive `@media (max-width: 900px)`: stacks About canvas and windows cleanly in document order above the dock.

- [ ] **7b. Verify:** `npm run build` succeeds and layout renders without overflow.
- [ ] **Commit:** `style: style static About canvas, floating windows, and dock`

---

## Task 8: Playwright Test Suite Update & Verification

**Files:**
- Rewrite: `tests/` specs to assert the new single-page architecture

- [ ] **8a. Update E2E tests:**
- Assert About section is on the page canvas (not inside a window or iframe).
- Assert `MEET-MAZEN` and `SOCIALS` windows are open on load.
- Assert dock toggles windows open/closed.
- Assert window dragging and z-index elevation.
- Assert in-window blog reading and `/blog/[slug]/` canonical route.
- Assert 0 horizontal overflow at 320px, 390px, 768px, 1280px.

- [ ] **8b. Run test suite:** `npm run test` passes 100%.
- [ ] **Commit:** `test: update Playwright suite for single-page desktop`

---

## Task 9: Final Quality Gate

- [ ] **9a. Run:**
  - `npm run check` (0 errors)
  - `npm run format`
  - `npm run format:check`
  - `npm run build`
  - `npm run test:e2e`
- [ ] **Commit:** `chore: final verification for single-page desktop redesign`
