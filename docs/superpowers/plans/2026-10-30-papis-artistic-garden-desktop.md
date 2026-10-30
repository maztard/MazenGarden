# Papi's Artistic Garden — Desktop Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current scrolling MazenGarden site with a full-viewport Win95-style retro desktop: bottom-center floating dock, draggable/stacking iframe windows, About + pinned Photos hero, real blog URLs, pixel icons and emoji, and a new visible identity — **Papi's Artistic Garden**.

**Spec:** `docs/superpowers/specs/2026-10-30-papis-artistic-garden-desktop-design.md` (Approved — 2026-10-30)

**Architecture:** Astro 7 static output. Each desktop route renders a shared shell (`DesktopLayout`) with dock and positioned windows. App content lives at `/apps/<app>/` and loads inside iframe-backed windows. Blog posts are the exception: their content is server-rendered directly inside the desktop post window for SEO and no-JS readability. A single client script (`desktop.ts`) handles the clock, window dragging, stacking, close behavior, and iframe focus/height messages.

**Tech Stack:** Astro 7.4.3, TypeScript 6.0.3 (strict), npm, `@astrojs/rss` 4.0.19, `@astrojs/sitemap` 3.7.4, `sharp` 0.35.5, Playwright 1.64.1, Prettier 3.9.10 with `prettier-plugin-astro` 1.1.2.

## Global Constraints

- Base path `/MazenGarden`, trailing slashes, static output, GitHub Pages deployment — unchanged.
- Every internal URL goes through `withBase()`. Iframe `src` values are the highest-risk spot.
- No client-side SPA router. Dock links are plain `<a>` elements with full-page navigation.
- No window resize, minimize/maximize, snap, tiling, multiple instances, or position persistence.
- No fake menus, fake chrome, or dead controls. Every rendered control is real.
- Fonts self-hosted at runtime. Geist Pixel via Astro Fonts API (Google provider, downloaded at build). Dotemp local. SerenityOS Emoji local TTF (no preload).
- Curly apostrophe in the visible name: `Papi's Artistic Garden`.
- One real photo (`mazen-1.jpeg`) plus three scenic placeholders (`sky1`, `dorm1`, `random1`). `sky2` is removed from the photo set.
- Contact email: `mazenra100@gmail.com`. GitHub: `maztard`. Instagram: `@papisartisticgarden`.
- Run `npm run format` before each commit. Local commits only, no push.
- Old tests will fail until rewritten — that is expected, not a regression to patch around.
- `npm run check`, `npm run build`, `npm run format:check` must pass after the final task.

## Review Focus

1. **Base-path drift:** Links, iframes, fonts, images, feed items, or sitemap URLs missing or doubling `/MazenGarden/`.
2. **Iframe navigation traps:** Internal links inside app iframes that don't use `target="_top"` will trap the user.
3. **Iframe drag swallowing:** Pointer falls into iframe during drag, breaks the interaction.
4. **Mobile nested scroll:** Iframe height messaging fails, producing double scrollbars.
5. **320px overflow:** Dock, window, or "Me!" offset pushes the page sideways.
6. **Font loading in iframes:** App layout must include font setup independently of parent.
7. **Emoji licensing:** Missing CC BY or BSD notices is a real defect.

---

## File Map

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Site/base/trailing-slash, sitemap filter, fonts (add SerenityOS Emoji) |
| `package.json` | Name update to `papis-artistic-garden` |
| `src/consts.ts` | `SITE_TITLE`, `SITE_DESCRIPTION`, `HOME_TITLE`, `CONTACT_EMAIL`, `GITHUB_URL`, `INSTAGRAM_URL` |
| `src/data/apps.ts` | App registry: id, label, route, appRoute, icon, windowTitle |
| `src/data/icons.ts` | Pixel icon grid data for all UI icons |
| `src/data/photos.ts` | Photo array with image imports and alt text |
| `src/layouts/DesktopLayout.astro` | Desktop shell: head, stage, dock, client script |
| `src/layouts/AppLayout.astro` | Bare app document: head, fonts, canonical, embedded detection |
| `src/components/desktop/DesktopDock.astro` | Win95 taskbar: nav, app buttons, clock |
| `src/components/desktop/DockButton.astro` | Single dock button with icon, tooltip, active state |
| `src/components/desktop/DesktopWindow.astro` | Window chrome: bar, title, close/pin, iframe or slot body |
| `src/components/ui/PixelIcon.astro` | SVG renderer for pixel icon grid data |
| `src/components/ui/PixelEmoji.astro` | Inline pixel emoji SVG renderer |
| `src/components/ui/PostCard.astro` | Restyled post card (moved from `src/components/`) |
| `src/components/apps/AboutApp.astro` | About app content |
| `src/components/apps/PhotosApp.astro` | Photos app content (2×2 grid) |
| `src/components/apps/ProjectsApp.astro` | Projects app content |
| `src/components/apps/WritingApp.astro` | Writing app content (post list) |
| `src/components/apps/ContactApp.astro` | Contact app content |
| `src/components/apps/RssApp.astro` | RSS app content |
| `src/components/PostWindow.astro` | Post window body: article rendered directly |
| `src/pages/index.astro` | Home: About window + pinned Photos window |
| `src/pages/photos/index.astro` | Photos shell route |
| `src/pages/projects/index.astro` | Projects shell route |
| `src/pages/contact/index.astro` | Contact shell route |
| `src/pages/rss/index.astro` | RSS shell route |
| `src/pages/blog/index.astro` | Writing shell route |
| `src/pages/blog/[slug].astro` | Post shell route (content in parent document) |
| `src/pages/404.astro` | 404 shell route |
| `src/pages/apps/about/index.astro` | About app document |
| `src/pages/apps/photos/index.astro` | Photos app document |
| `src/pages/apps/projects/index.astro` | Projects app document |
| `src/pages/apps/writing/index.astro` | Writing app document |
| `src/pages/apps/contact/index.astro` | Contact app document |
| `src/pages/apps/rss/index.astro` | RSS app document |
| `src/pages/rss.xml.ts` | RSS feed (title + description update) |
| `src/scripts/desktop.ts` | Client script: clock, drag, stack, close, iframe messages |
| `src/styles/global.css` | Complete restyle: desktop bg, dock, windows, apps, responsive |
| `public/favicon.svg` | Pixel flower favicon |
| `public/licenses/PixelTwemoji.txt` | CC BY 4.0 attribution |
| `public/licenses/SerenityOS-Emoji.txt` | BSD-2-Clause notice |
| `public/robots.txt` | Unchanged (existing sitemap URL) |
| `THIRD_PARTY_NOTICES.md` | Combined licensing doc |
| `README.md` | New name, architecture, routes, authoring docs |
| `scripts/extract-pixel-emojis.mjs` | Emoji extraction script (builds `src/assets/emoji/`) |
| `src/assets/fonts/SerenityOS-Emoji.ttf` | Pixel emoji fallback font |
| `src/assets/emoji/*.svg` | Extracted pixel emoji SVGs |
| `tests/*.spec.ts` | Rewritten Playwright suite |

**Files to remove** after content is migrated:
`src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/PhotoCard.astro`, `src/components/ProjectsWindow.astro`, `src/layouts/BlogPost.astro`

---

## Task 1: Data layer — app registry, icons, photos, and constants

**Why first:** Every subsequent component reads from these data files. No UI yet.

**Files:**
- Edit: `src/consts.ts`
- Create: `src/data/apps.ts`, `src/data/icons.ts`, `src/data/photos.ts`

### Steps

- [ ] **1a. Update `src/consts.ts`** — replace existing constants and add contact/social:

```ts
export const SITE_TITLE = 'Papi\u2019s Artistic Garden';
export const SITE_DESCRIPTION =
  'Papi\u2019s Artistic Garden \u2014 the personal site of Mazen Ragab (Maztardoo), a G12 STEM student into technology, AI, marketing, psychology, and building things.';
export const HOME_TITLE = 'Papi\u2019s Artistic Garden \u2014 Mazen Ragab (Maztardoo)';

export const CONTACT_EMAIL = 'mazenra100@gmail.com';
export const GITHUB_URL = 'https://github.com/maztard';
export const INSTAGRAM_URL = 'https://www.instagram.com/papisartisticgarden/';
```

- [ ] **1b. Create `src/data/apps.ts`** — the app registry:

```ts
export type AppId = 'home' | 'photos' | 'projects' | 'writing' | 'contact' | 'rss';

export interface AppDefinition {
  id: AppId;
  label: string;
  route: string;        // base-relative shell route
  appRoute: string;     // base-relative iframe document route
  icon: string;         // pixel icon name from icons.ts
  windowTitle: string;
}

export const apps: AppDefinition[] = [
  { id: 'home',     label: 'Home',     route: '/',          appRoute: '/apps/about/',    icon: 'home',     windowTitle: 'About Me!' },
  { id: 'photos',   label: 'Photos',   route: '/photos/',   appRoute: '/apps/photos/',   icon: 'photos',   windowTitle: 'My Photos' },
  { id: 'projects', label: 'Projects', route: '/projects/', appRoute: '/apps/projects/', icon: 'projects', windowTitle: 'Projects' },
  { id: 'writing',  label: 'Writing',  route: '/blog/',     appRoute: '/apps/writing/',  icon: 'writing',  windowTitle: 'Writing' },
  { id: 'contact',  label: 'Contact',  route: '/contact/',  appRoute: '/apps/contact/',  icon: 'contact',  windowTitle: 'Contact' },
  { id: 'rss',      label: 'RSS',      route: '/rss/',      appRoute: '/apps/rss/',      icon: 'rss',      windowTitle: 'RSS' },
];

export function getApp(id: AppId): AppDefinition {
  const app = apps.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
```

- [ ] **1c. Create `src/data/icons.ts`** — pixel icon grid data. Each icon is a named record mapping to an array of `[x, y]` filled-cell coordinates on a 16×16 grid. Required icons: `home`, `photos`, `projects`, `writing`, `contact`, `rss`, `close`, `pin`, `flower`. The grids must produce recognizable pixel art at 16px and 20px. Export type `PixelGrid = [number, number][]` and `icons: Record<string, PixelGrid>`.

Design each icon as a clearly identifiable 16×16 pixel art glyph:
- `home`: simple house silhouette with peaked roof and door
- `photos`: camera outline with lens circle
- `projects`: shopping cart (matches existing ProjectsWindow icon)
- `writing`: pencil at a diagonal
- `contact`: mail envelope
- `rss`: RSS broadcast waves symbol
- `close`: X cross (2px strokes)
- `pin`: thumbtack / pushpin
- `flower`: five petals around a center dot (the site mark)

- [ ] **1d. Create `src/data/photos.ts`** — four-photo array:

```ts
import type { ImageMetadata } from 'astro';
import mazen1 from '../assets/images/me/mazen-1.jpeg';
import sky1 from '../assets/images/sky1.jpeg';
import dorm1 from '../assets/images/dorm1.jpeg';
import random1 from '../assets/images/random1.jpeg';

export interface Photo {
  image: ImageMetadata;
  alt: string;
  caption?: string;
}

export const photos: Photo[] = [
  { image: mazen1, alt: 'Mazen standing on a grassy hill under a leafy tree at night, looking to his left.' },
  { image: sky1, alt: 'Night sky with a bright moon behind dark leaves.' },
  { image: dorm1, alt: 'Lit dormitory hallway with tiled walls and doors.' },
  { image: random1, alt: 'Streetlight glowing over palm leaves at night.' },
];
```

- [ ] **1e. Verify** — `npm run check` passes with the new data files. No build needed yet (no pages consume them).

**Commit:** `feat: add app registry, pixel icon data, photo data, and contact constants`

---

## Task 2: Pixel icon component

**Why now:** The dock and window components need `PixelIcon` to render icons.

**Files:**
- Create: `src/components/ui/PixelIcon.astro`

### Steps

- [ ] **2a. Create `src/components/ui/PixelIcon.astro`:**

```astro
---
import { icons, type PixelGrid } from '../../data/icons';

interface Props {
  name: string;
  size?: number;     // rendered size in px (default 16)
  class?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

const { name, size = 16, class: className, 'aria-hidden': ariaHidden = true } = Astro.props;
const grid: PixelGrid = icons[name];
if (!grid) throw new Error(`Unknown icon: ${name}`);

// Group consecutive filled cells in each row into rect runs for fewer SVG elements.
type Rect = { x: number; y: number; w: number };
const rects: Rect[] = [];
const rowMap = new Map<number, number[]>();
for (const [x, y] of grid) {
  if (!rowMap.has(y)) rowMap.set(y, []);
  rowMap.get(y)!.push(x);
}
for (const [y, xs] of rowMap) {
  xs.sort((a, b) => a - b);
  let start = xs[0], prev = xs[0];
  for (let i = 1; i <= xs.length; i++) {
    if (i < xs.length && xs[i] === prev + 1) { prev = xs[i]; continue; }
    rects.push({ x: start, y, w: prev - start + 1 });
    if (i < xs.length) { start = xs[i]; prev = xs[i]; }
  }
}
---

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 16 16"
  width={size}
  height={size}
  fill="currentColor"
  shape-rendering="crispEdges"
  class={className}
  aria-hidden={String(ariaHidden)}
  role={ariaHidden ? undefined : 'img'}
>
  {rects.map((r) => (
    <rect x={r.x} y={r.y} width={r.w} height={1} />
  ))}
</svg>
```

- [ ] **2b. Verify** — `npm run check` passes.

**Commit:** `feat: add PixelIcon component`

---

## Task 3: Desktop shell layout, dock, and window components

**Why now:** These are the structural building blocks every page needs. No routes yet — just the components.

**Files:**
- Create: `src/layouts/DesktopLayout.astro`, `src/components/desktop/DesktopDock.astro`, `src/components/desktop/DockButton.astro`, `src/components/desktop/DesktopWindow.astro`

### Steps

- [ ] **3a. Create `src/layouts/DesktopLayout.astro`:**

Props: `title?: string`, `description?: string`, `noindex?: boolean`, `activeApp?: AppId`, `hiddenH1?: string`.

Structure:
```
<!doctype html>
<html lang="en">
  <head>
    charset, viewport, <title>, description, canonical, optional noindex,
    favicon (withBase('/favicon.svg')),
    RSS alternate (withBase('/rss.xml'), title "Papi's Artistic Garden RSS"),
    sitemap link (withBase('/sitemap-index.xml')),
    <Font cssVariable="--font-dotemp" preload />,
    <Font cssVariable="--font-geist-pixel" preload />,
    SerenityOS Emoji @font-face is in global.css — no extra head link needed.
  </head>
  <body>
    <a class="skip-link" href="#desktop">Skip to content</a>
    {hiddenH1 && <h1 class="visually-hidden">{hiddenH1}</h1>}
    <main class="desktop" id="desktop">
      <div class="desktop__stage">
        <slot />
      </div>
      <DesktopDock activeApp={activeApp} />
    </main>
    <script src="../scripts/desktop.ts"></script>
  </body>
</html>
```

Import `../styles/global.css`, `Font` from `astro:assets`, `DesktopDock`, `SITE_TITLE`, `SITE_DESCRIPTION`, `withBase`. Compute canonical the same way as `BaseLayout`.

- [ ] **3b. Create `src/components/desktop/DockButton.astro`:**

Props: `app: AppDefinition`, `isActive: boolean`, `ariaCurrent?: 'page' | 'location'`.

Structure:
```html
<li>
  <a
    href={withBase(app.route)}
    class:list={['dock__button', { 'dock__button--active': isActive }]}
    data-app-id={app.id}
    aria-label={app.label}
    aria-current={isActive ? ariaCurrent ?? 'page' : undefined}
    title={app.label}
  >
    <PixelIcon name={app.icon} size={20} />
  </a>
</li>
```

Note: `aria-current="location"` is used on Writing when the current page is a post under `/blog/[slug]/`, because the user is within the Writing section but not on the Writing index. Default `ariaCurrent` to `'page'` when `isActive` is true.

- [ ] **3c. Create `src/components/desktop/DesktopDock.astro`:**

Props: `activeApp?: AppId`, `ariaCurrent?: 'page' | 'location'`.

Structure:
```html
<div class="dock" role="region" aria-label="Taskbar">
  <nav class="dock__apps" aria-label="Desktop applications">
    <ul>
      {apps.map((app) => (
        <DockButton
          app={app}
          isActive={app.id === activeApp}
          ariaCurrent={app.id === activeApp ? ariaCurrent ?? 'page' : undefined}
        />
      ))}
    </ul>
  </nav>
  <div class="dock__clock" aria-label="Clock">
    <span data-clock>--:--</span>
  </div>
</div>
```

Import `apps` from `../../data/apps`, `DockButton`, `withBase`.

- [ ] **3d. Create `src/components/desktop/DesktopWindow.astro`:**

Props:
```ts
interface Props {
  windowId: string;         // e.g. 'photos'
  windowTitle: string;      // e.g. 'My Photos'
  icon: string;             // pixel icon name
  pinned?: boolean;         // default false
  iframeSrc?: string;       // if set, body contains iframe; otherwise uses slot
  iframeTitle?: string;     // required when iframeSrc is set
  class?: string;           // extra CSS class for per-window sizing
}
```

Structure:
```html
<section
  class:list={['desktop-window', Astro.props.class]}
  data-window
  data-window-id={windowId}
  aria-labelledby={`${windowId}-window-title`}
>
  <div class="desktop-window__bar" data-window-handle>
    <PixelIcon name={icon} size={16} />
    <span class="desktop-window__title" id={`${windowId}-window-title`}>
      {windowTitle}
    </span>
    {pinned ? (
      <span class="desktop-window__pin" aria-hidden="true">
        <PixelIcon name="pin" size={14} />
      </span>
    ) : (
      <button
        class="desktop-window__close"
        type="button"
        data-window-close
        aria-label={`Close ${windowTitle}`}
      >
        <PixelIcon name="close" size={14} />
      </button>
    )}
  </div>
  <div class="desktop-window__body">
    {iframeSrc ? (
      <iframe src={withBase(iframeSrc)} title={iframeTitle ?? windowTitle} />
    ) : (
      <slot />
    )}
  </div>
  {pinned && (
    <div class="desktop-window__status">always open</div>
  )}
</section>
```

- [ ] **3e. Verify** — `npm run check` passes with all new components.

**Commit:** `feat: add DesktopLayout, DesktopDock, DockButton, and DesktopWindow components`

---

## Task 4: App layout and app content components

**Why now:** App documents need `AppLayout`; shell routes need the content components. Build them before wiring pages.

**Files:**
- Create: `src/layouts/AppLayout.astro`, `src/components/apps/AboutApp.astro`, `src/components/apps/PhotosApp.astro`, `src/components/apps/ProjectsApp.astro`, `src/components/apps/WritingApp.astro`, `src/components/apps/ContactApp.astro`, `src/components/apps/RssApp.astro`, `src/components/PostWindow.astro`
- Move: `src/components/PostCard.astro` → `src/components/ui/PostCard.astro` (update all imports)

### Steps

- [ ] **4a. Create `src/layouts/AppLayout.astro`:**

Props: `title?: string`, `description?: string`, `canonicalPath: string` (base-relative shell route for canonical).

Structure:
```
<!doctype html>
<html lang="en">
  <head>
    charset, viewport, <title>, description,
    <link rel="canonical" href={canonical} />  ← computed from canonicalPath + site
    <link rel="icon" type="image/svg+xml" href={withBase('/favicon.svg')} />
    <link rel="alternate" type="application/rss+xml" title="Papi's Artistic Garden RSS" href={withBase('/rss.xml')} />
    <link rel="sitemap" href={withBase('/sitemap-index.xml')} />
    <Font cssVariable="--font-dotemp" preload />
    <Font cssVariable="--font-geist-pixel" preload />
  </head>
  <body data-app-doc>
    <a class="app-escape" href={withBase(canonicalPath)} target="_top">
      ← Papi's desktop
    </a>
    <div class="app-content">
      <slot />
    </div>
    <script>
      // Set data-embedded when inside an iframe; CSS hides .app-escape
      if (window.self !== window.top) {
        document.body.dataset.embedded = '';
      }
      // Post papi:focus to parent on pointerdown
      document.addEventListener('pointerdown', () => {
        if (window.self !== window.top && window.parent) {
          window.parent.postMessage({ type: 'papi:focus' }, window.location.origin);
        }
      });
      // Post papi:height to parent for mobile iframe sizing
      if (window.self !== window.top && window.parent) {
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            window.parent.postMessage(
              { type: 'papi:height', height: entry.contentRect.height },
              window.location.origin,
            );
          }
        });
        ro.observe(document.body);
      }
    </script>
  </body>
</html>
```

Import `../styles/global.css`, `Font` from `astro:assets`, `SITE_TITLE` from `../consts`, `withBase` from `../utils/url`.

CSS rules (in global.css):
- `[data-embedded] .app-escape { display: none; }`
- `.app-content { padding: 1rem 1.25rem; }` — white background, the pixel bg belongs to the shell.
- `.app-escape { display: block; padding: 0.5rem 0; font-size: 0.85rem; }`

- [ ] **4b. Move `src/components/PostCard.astro` → `src/components/ui/PostCard.astro`:**

Copy the file, update its internal imports (`../../utils/posts`, `../../utils/date`). The existing `PostCard` is kept during migration; old references are updated when their consuming pages are rewritten (Tasks 5–6). The old file is deleted in Task 9.

- [ ] **4c. Create `src/components/apps/AboutApp.astro`:**

No props. Contains:
```html
<p class="app-kicker">PAPI'S ARTISTIC GARDEN</p>
<h1 class="about-title">
  About <span class="about-title__accent">Me!</span>
</h1>
<p class="about-name">Mazen Ragab aka <span class="accent">(Maztardoo)</span></p>
<div class="about-bio">
  <!-- The five existing bio paragraphs verbatim from index.astro -->
</div>
<nav class="about-footer">
  <a href={withBase('/blog/')} target="_top">Writing →</a>
  <a href={withBase('/photos/')} target="_top">Photos →</a>
</nav>
<p class="about-credits">
  Icons by <a href={withBase('/licenses/PixelTwemoji.txt')} target="_top">PixelTwemoji</a>.
  Emoji font by <a href={withBase('/licenses/SerenityOS-Emoji.txt')} target="_top">SerenityOS</a>.
</p>
```

CSS for `.about-title__accent`:
- `display: block; color: var(--color-accent); font-family: var(--font-dotemp); font-style: italic; font-weight: bold; margin-left: clamp(3.5rem, 26%, 8rem);`
- This must never rejoin the "About" line — `display: block` guarantees it.

- [ ] **4d. Create `src/components/apps/PhotosApp.astro`:**

No props. Imports `photos` from `../../data/photos` and `Image` from `astro:assets`.

```html
<h1>My Photos</h1>
<p class="app-lede">Snapshots from my life.</p>
<div class="photo-grid">
  {photos.map((photo) => (
    <div class="photo-grid__item">
      <Image
        src={photo.image}
        alt={photo.alt}
        widths={[240, 360, 480]}
        sizes="(min-width: 64rem) 14rem, (min-width: 40rem) 40vw, 44vw"
        loading="eager"
        class="photo-grid__image"
      />
    </div>
  ))}
</div>
<p class="photo-status">{photos.length} photos</p>
<p class="photo-ig">
  More on <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@papisartisticgarden</a>.
</p>
```

Empty-state: `{photos.length === 0 && <p class="empty-state">No photos yet.</p>}`

CSS: `.photo-grid` is `display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;`. Images have `border: 2px solid #1a1a1a; aspect-ratio: 1; object-fit: cover;`.

- [ ] **4e. Create `src/components/apps/ProjectsApp.astro`:**

No props.

```html
<h1>Projects</h1>
<p class="app-lede">Things I've built or am building.</p>
<ul class="projects-list">
  <li>
    <a href="https://emadeats.vercel.app" target="_blank" rel="noopener noreferrer">
      EmadEats Project
    </a>
  </li>
  <li><span>BuggyEyes</span></li>
  <li><span>Sudany</span></li>
</ul>
```

No invented descriptions. External link opens new tab.

- [ ] **4f. Create `src/components/apps/WritingApp.astro`:**

Props: `posts: BlogPost[]` (passed from the app page, which calls `getPublishedPosts()`).

```html
<h1>Writing</h1>
<p class="app-lede">Notes on whatever I'm curious about.</p>
{posts.length === 0 ? (
  <p class="empty-state">No posts yet. Check back soon.</p>
) : (
  <ul class="post-list">
    {posts.map((post) => (
      <li>
        <PostCard post={post} headingLevel="h2" linkTarget="_top" />
      </li>
    ))}
  </ul>
)}
<nav class="app-footer">
  <a href={withBase('/rss/')} target="_top">RSS →</a>
</nav>
```

Update `PostCard` to accept an optional `linkTarget` prop and apply it to the title `<a>` tag. Default is no target (same frame).

- [ ] **4g. Create `src/components/apps/ContactApp.astro`:**

No props.

```html
<h1>Contact</h1>
<p class="app-lede">Say hi or send me a project idea.</p>
<ul class="contact-list">
  <li>
    <PixelIcon name="contact" size={16} />
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  </li>
  <li>
    <PixelIcon name="home" size={16} />
    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
  </li>
  <li>
    <PixelIcon name="photos" size={16} />
    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
  </li>
</ul>
```

Import `CONTACT_EMAIL`, `GITHUB_URL`, `INSTAGRAM_URL` from `../../consts`.

- [ ] **4h. Create `src/components/apps/RssApp.astro`:**

Props: `posts: BlogPost[]`.

```html
<h1>RSS</h1>
<p class="app-lede">Read the garden in your favorite feed reader.</p>
<div class="rss-url">
  <code id="feed-url">{feedUrl}</code>
  <button type="button" data-copy-feed aria-label="Copy feed URL">Copy</button>
</div>
<noscript><p class="rss-fallback">Copy the URL above into your reader.</p></noscript>
{posts.length > 0 && (
  <section>
    <h2>Latest posts</h2>
    <ul class="post-list">
      {posts.map((post) => (
        <li>
          <PostCard post={post} headingLevel="h3" linkTarget="_top" />
        </li>
      ))}
    </ul>
  </section>
)}
```

Compute `feedUrl` from `new URL(withBase('/rss.xml'), Astro.site ?? Astro.url.origin).href`.

The copy button script (inline `<script>`):
```js
const btn = document.querySelector('[data-copy-feed]');
const url = document.getElementById('feed-url');
if (btn && url) {
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(url.textContent ?? '');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}
```

- [ ] **4i. Create `src/components/PostWindow.astro`:**

Props: `post: BlogPost`, `Content: AstroComponentFactory`.

This component renders the post article directly (not in an iframe) inside a `DesktopWindow` slot. It is used by `src/pages/blog/[slug].astro`.

```html
<a class="post__back" href={withBase('/blog/')}>← All writing</a>
<article class="post-article">
  <header class="post__header">
    <h1 class="post__title">{post.data.title}</h1>
    <p class="post__meta">
      <time datetime={post.data.date.toISOString()}>{formatDate(post.data.date)}</time>
    </p>
  </header>
  <p class="post__lede">{post.data.description}</p>
  <div class="prose">
    <Content />
  </div>
  <footer class="post__footer">
    <a class="post__back" href={withBase('/blog/')}>← All writing</a>
  </footer>
</article>
```

- [ ] **4j. Verify** — `npm run check` passes.

**Commit:** `feat: add AppLayout, app content components, and PostWindow`

---

## Task 5: App document pages (iframe sources)

**Why now:** The iframe `src` targets must exist before shell routes can reference them.

**Files:**
- Create: `src/pages/apps/about/index.astro`, `src/pages/apps/photos/index.astro`, `src/pages/apps/projects/index.astro`, `src/pages/apps/writing/index.astro`, `src/pages/apps/contact/index.astro`, `src/pages/apps/rss/index.astro`

### Steps

Each app page follows the same pattern:

```astro
---
import AppLayout from '../../../layouts/AppLayout.astro';
import XxxApp from '../../../components/apps/XxxApp.astro';
---

<AppLayout title="Xxx · Papi's Artistic Garden" canonicalPath="/route/">
  <XxxApp />
</AppLayout>
```

- [ ] **5a. Create `src/pages/apps/about/index.astro`:**

```astro
---
import AppLayout from '../../../layouts/AppLayout.astro';
import AboutApp from '../../../components/apps/AboutApp.astro';
import { HOME_TITLE } from '../../../consts';
---

<AppLayout title={HOME_TITLE} canonicalPath="/">
  <AboutApp />
</AppLayout>
```

- [ ] **5b. Create `src/pages/apps/photos/index.astro`:**

```astro
---
import AppLayout from '../../../layouts/AppLayout.astro';
import PhotosApp from '../../../components/apps/PhotosApp.astro';
import { SITE_TITLE } from '../../../consts';
---

<AppLayout title={`Photos · ${SITE_TITLE}`} canonicalPath="/photos/">
  <PhotosApp />
</AppLayout>
```

- [ ] **5c. Create `src/pages/apps/projects/index.astro`:**

```astro
---
import AppLayout from '../../../layouts/AppLayout.astro';
import ProjectsApp from '../../../components/apps/ProjectsApp.astro';
import { SITE_TITLE } from '../../../consts';
---

<AppLayout title={`Projects · ${SITE_TITLE}`} canonicalPath="/projects/">
  <ProjectsApp />
</AppLayout>
```

- [ ] **5d. Create `src/pages/apps/writing/index.astro`:**

```astro
---
import AppLayout from '../../../layouts/AppLayout.astro';
import WritingApp from '../../../components/apps/WritingApp.astro';
import { getPublishedPosts } from '../../../utils/posts';
import { SITE_TITLE } from '../../../consts';

const posts = await getPublishedPosts();
---

<AppLayout title={`Writing · ${SITE_TITLE}`} canonicalPath="/blog/">
  <WritingApp posts={posts} />
</AppLayout>
```

- [ ] **5e. Create `src/pages/apps/contact/index.astro`:**

```astro
---
import AppLayout from '../../../layouts/AppLayout.astro';
import ContactApp from '../../../components/apps/ContactApp.astro';
import { SITE_TITLE } from '../../../consts';
---

<AppLayout title={`Contact · ${SITE_TITLE}`} canonicalPath="/contact/">
  <ContactApp />
</AppLayout>
```

- [ ] **5f. Create `src/pages/apps/rss/index.astro`:**

```astro
---
import AppLayout from '../../../layouts/AppLayout.astro';
import RssApp from '../../../components/apps/RssApp.astro';
import { getPublishedPosts } from '../../../utils/posts';
import { SITE_TITLE } from '../../../consts';

const posts = await getPublishedPosts();
---

<AppLayout title={`RSS · ${SITE_TITLE}`} canonicalPath="/rss/">
  <RssApp posts={posts} />
</AppLayout>
```

- [ ] **5g. Verify** — `npm run check` passes.

**Commit:** `feat: add app document pages under /apps/`

---

## Task 6: Shell routes — home, single-app pages, blog, post, and 404

**Why now:** All components exist. Wire them into real pages.

**Files:**
- Rewrite: `src/pages/index.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/404.astro`
- Create: `src/pages/photos/index.astro`, `src/pages/projects/index.astro`, `src/pages/contact/index.astro`, `src/pages/rss/index.astro`
- Delete: `src/layouts/BlogPost.astro` (no longer used; post layout is now inline in `[slug].astro`)

### Steps

- [ ] **6a. Rewrite `src/pages/index.astro` — Home:**

```astro
---
import DesktopLayout from '../layouts/DesktopLayout.astro';
import DesktopWindow from '../components/desktop/DesktopWindow.astro';
import { getApp } from '../data/apps';
import { HOME_TITLE, SITE_DESCRIPTION } from '../consts';

const home = getApp('home');
const photos = getApp('photos');
---

<DesktopLayout title={HOME_TITLE} description={SITE_DESCRIPTION} activeApp="home">
  <DesktopWindow
    windowId="about"
    windowTitle={home.windowTitle}
    icon={home.icon}
    iframeSrc={home.appRoute}
    class="window--about-home"
  />
  <DesktopWindow
    windowId="photos"
    windowTitle={photos.windowTitle}
    icon={photos.icon}
    pinned
    iframeSrc={photos.appRoute}
    class="window--photos-home"
  />
</DesktopLayout>
```

CSS: `.window--about-home` has left/top/width/height for the left side. `.window--photos-home` for the right side. Values from the spec:
- About: `left: 5vw; top: 12vh; width: min(30rem, 42vw); height: min(36rem, 70vh);`
- Photos: `right: 6vw; top: 17vh; width: min(29rem, 40vw); height: min(25rem, 52vh);` — translate `right` to a `left` calc.

- [ ] **6b. Create `src/pages/photos/index.astro` — Photos standalone:**

```astro
---
import DesktopLayout from '../../layouts/DesktopLayout.astro';
import DesktopWindow from '../../components/desktop/DesktopWindow.astro';
import { getApp } from '../../data/apps';
import { SITE_TITLE } from '../../consts';

const photos = getApp('photos');
---

<DesktopLayout
  title={`Photos · ${SITE_TITLE}`}
  activeApp="photos"
  hiddenH1="Photos"
>
  <DesktopWindow
    windowId="photos"
    windowTitle={photos.windowTitle}
    icon={photos.icon}
    iframeSrc={photos.appRoute}
    class="window--single"
  />
</DesktopLayout>
```

The same pattern applies to Projects, Contact, and RSS (steps 6c–6e below). Each gets `class="window--single"`.

- [ ] **6c. Create `src/pages/projects/index.astro` — Projects standalone:**

```astro
---
import DesktopLayout from '../../layouts/DesktopLayout.astro';
import DesktopWindow from '../../components/desktop/DesktopWindow.astro';
import { getApp } from '../../data/apps';
import { SITE_TITLE } from '../../consts';

const projects = getApp('projects');
---

<DesktopLayout
  title={`Projects · ${SITE_TITLE}`}
  activeApp="projects"
  hiddenH1="Projects"
>
  <DesktopWindow
    windowId="projects"
    windowTitle={projects.windowTitle}
    icon={projects.icon}
    iframeSrc={projects.appRoute}
    class="window--single"
  />
</DesktopLayout>
```

- [ ] **6d. Create `src/pages/contact/index.astro` — Contact standalone:**

```astro
---
import DesktopLayout from '../../layouts/DesktopLayout.astro';
import DesktopWindow from '../../components/desktop/DesktopWindow.astro';
import { getApp } from '../../data/apps';
import { SITE_TITLE } from '../../consts';

const contact = getApp('contact');
---

<DesktopLayout
  title={`Contact · ${SITE_TITLE}`}
  activeApp="contact"
  hiddenH1="Contact"
>
  <DesktopWindow
    windowId="contact"
    windowTitle={contact.windowTitle}
    icon={contact.icon}
    iframeSrc={contact.appRoute}
    class="window--single"
  />
</DesktopLayout>
```

- [ ] **6e. Create `src/pages/rss/index.astro` — RSS standalone:**

```astro
---
import DesktopLayout from '../../layouts/DesktopLayout.astro';
import DesktopWindow from '../../components/desktop/DesktopWindow.astro';
import { getApp } from '../../data/apps';
import { SITE_TITLE } from '../../consts';

const rss = getApp('rss');
---

<DesktopLayout
  title={`RSS · ${SITE_TITLE}`}
  activeApp="rss"
  hiddenH1="RSS"
>
  <DesktopWindow
    windowId="rss"
    windowTitle={rss.windowTitle}
    icon={rss.icon}
    iframeSrc={rss.appRoute}
    class="window--single"
  />
</DesktopLayout>
```

- [ ] **6f. Rewrite `src/pages/blog/index.astro` — Writing:**

```astro
---
import DesktopLayout from '../../layouts/DesktopLayout.astro';
import DesktopWindow from '../../components/desktop/DesktopWindow.astro';
import { getApp } from '../../data/apps';
import { SITE_TITLE } from '../../consts';

const writing = getApp('writing');
---

<DesktopLayout
  title={`Writing · ${SITE_TITLE}`}
  activeApp="writing"
  hiddenH1="Writing"
>
  <DesktopWindow
    windowId="writing"
    windowTitle={writing.windowTitle}
    icon={writing.icon}
    iframeSrc={writing.appRoute}
    class="window--single"
  />
</DesktopLayout>
```

- [ ] **6g. Rewrite `src/pages/blog/[slug].astro` — Post:**

```astro
---
import { render } from 'astro:content';
import DesktopLayout from '../../layouts/DesktopLayout.astro';
import DesktopWindow from '../../components/desktop/DesktopWindow.astro';
import PostWindow from '../../components/PostWindow.astro';
import { getPublishedPosts } from '../../utils/posts';
import { SITE_TITLE } from '../../consts';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<DesktopLayout
  title={`${post.data.title} · ${SITE_TITLE}`}
  description={post.data.description}
  activeApp="writing"
>
  <DesktopWindow
    windowId="post"
    windowTitle={`Writing — ${post.data.title}`}
    icon="writing"
    pinned
    class="window--post"
  >
    <PostWindow post={post} Content={Content} />
  </DesktopWindow>
</DesktopLayout>
```

Notes:
- Post window is **pinned** (no close button) per the spec.
- No `hiddenH1` — the post `h1` is the visible heading inside the window.
- `ariaCurrent` on the Writing dock link should be `"location"` (not `"page"`) since this is a child of `/blog/`. Pass `ariaCurrent="location"` to `DesktopLayout`; add this as an optional prop that flows to `DesktopDock` → `DockButton`.

- [ ] **6h. Rewrite `src/pages/404.astro` — 404:**

```astro
---
import DesktopLayout from '../layouts/DesktopLayout.astro';
import DesktopWindow from '../components/desktop/DesktopWindow.astro';
import { withBase } from '../utils/url';
import { SITE_TITLE } from '../consts';
---

<DesktopLayout
  title={`Page not found · ${SITE_TITLE}`}
  description="The page you were looking for does not exist."
  noindex
>
  <DesktopWindow
    windowId="not-found"
    windowTitle="Page not found"
    icon="close"
    pinned
    class="window--single"
  >
    <div class="not-found-body">
      <h1 class="not-found__title">404</h1>
      <p class="not-found__text">This page wandered off.</p>
      <a class="not-found__link" href={withBase('/')}>← Back home</a>
    </div>
  </DesktopWindow>
</DesktopLayout>
```

404 window is pinned. No `activeApp` (no dock link is active). No iframe.

- [ ] **6i. Delete `src/layouts/BlogPost.astro`** — its content now lives in `PostWindow.astro` + `[slug].astro`.

- [ ] **6j. Verify** — `npm run check` passes. Run `npm run build` — all routes should generate HTML. Spot-check `dist/MazenGarden/index.html`, `dist/MazenGarden/blog/hello-world/index.html`, `dist/MazenGarden/apps/about/index.html`, and `dist/MazenGarden/404.html` for correct structure.

**Commit:** `feat: add shell routes, rewrite home/blog/post/404 to desktop layout`

---

## Task 7: Client script — clock, drag, stack, close, iframe messages

**Why now:** The HTML structure is in place. The script makes it interactive.

**Files:**
- Create: `src/scripts/desktop.ts`

### Steps

- [ ] **7a. Create `src/scripts/desktop.ts`:**

The script is a plain TypeScript module bundled by Astro. No external libraries. Handles clock, window stacking, dragging with pointer capture, close button handling, iframe communication, and dock measurement.

```ts
let nextZ = 10;
let isDragging = false;

// === Clock ===
function initClock(): void {
  const clockEl = document.querySelector<HTMLElement>('[data-clock]');
  if (!clockEl) return;

  const update = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  };

  update();
  setInterval(update, 15000);
}

// === Window stacking ===
function bringToFront(win: HTMLElement): void {
  const currentZ = parseInt(win.style.zIndex || '10', 10);
  if (currentZ === nextZ - 1) return; // already topmost

  win.style.zIndex = String(nextZ++);

  document.querySelectorAll<HTMLElement>('[data-window]').forEach((w) => {
    const bar = w.querySelector<HTMLElement>('.desktop-window__bar');
    if (!bar) return;
    if (w === win) {
      bar.classList.add('desktop-window__bar--focused');
    } else {
      bar.classList.remove('desktop-window__bar--focused');
    }
  });
}

function initStacking(): void {
  const windows = Array.from(document.querySelectorAll<HTMLElement>('[data-window]'));
  if (windows.length === 0) return;

  // Initial focus on the last window (highest in document order)
  const topWin = windows[windows.length - 1];
  bringToFront(topWin);

  document.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('button')) return;

    const win = target.closest<HTMLElement>('[data-window]');
    if (win) bringToFront(win);
  });

  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const win = target.closest<HTMLElement>('[data-window]');
    if (win) bringToFront(win);
  });
}

// === Dragging ===
function initDrag(): void {
  const isDesktop = () => window.matchMedia('(min-width: 901px) and (pointer: fine)').matches;

  document.querySelectorAll<HTMLElement>('[data-window-handle]').forEach((handle) => {
    const win = handle.closest<HTMLElement>('[data-window]');
    if (!win) return;

    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    handle.addEventListener('pointerdown', (e) => {
      if (!isDesktop()) return;
      if ((e.target as HTMLElement).closest('button')) return;

      isDragging = true;
      document.body.classList.add('desktop--dragging');
      bringToFront(win);

      handle.setPointerCapture(e.pointerId);

      const rect = win.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;

      const onPointerMove = (ev: PointerEvent) => {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Clamp: keep at least 80px of the title bar visible
        const barWidth = win.offsetWidth;
        const minLeft = -barWidth + 80;
        const maxLeft = window.innerWidth - 80;
        const minTop = 0;
        const maxTop = window.innerHeight - 30;

        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        newTop = Math.max(minTop, Math.min(newTop, maxTop));

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
        win.style.transform = 'none'; // clear centering transform if set
      };

      const onPointerUp = (ev: PointerEvent) => {
        isDragging = false;
        document.body.classList.remove('desktop--dragging');
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener('pointermove', onPointerMove);
        handle.removeEventListener('pointerup', onPointerUp);
        handle.removeEventListener('pointercancel', onPointerUp);
      };

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
      handle.addEventListener('pointercancel', onPointerUp);
    });
  });

  // Reset positions on breakpoint crossing
  window.addEventListener('resize', () => {
    if (!isDesktop()) {
      document.querySelectorAll<HTMLElement>('[data-window]').forEach((win) => {
        win.style.left = '';
        win.style.top = '';
        win.style.transform = '';
      });
    }
  });
}

// === Close buttons ===
function initClose(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-window-close]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest<HTMLElement>('[data-window]');
      if (!win) return;

      win.hidden = true;

      // Bring next visible window forward
      const remaining = Array.from(document.querySelectorAll<HTMLElement>('[data-window]:not([hidden])'));
      if (remaining.length > 0) {
        bringToFront(remaining[remaining.length - 1]);
      }

      // Return focus to dock link
      const winId = win.dataset.windowId;
      if (winId) {
        const appId = winId === 'about' ? 'home' : winId;
        const dockLink = document.querySelector<HTMLElement>(`.dock__button[data-app-id="${appId}"], .dock__button`);
        dockLink?.focus();
      }
    });
  });
}

// === Iframe communication ===
function initIframeMessaging(): void {
  window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin) return;
    if (!e.data || typeof e.data !== 'object') return;

    if (e.data.type === 'papi:focus') {
      const iframes = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'));
      const targetIframe = iframes.find((f) => f.contentWindow === e.source);
      if (targetIframe) {
        const win = targetIframe.closest<HTMLElement>('[data-window]');
        if (win) bringToFront(win);
      }
    }

    if (e.data.type === 'papi:height' && typeof e.data.height === 'number') {
      if (isDragging) return;
      if (window.matchMedia('(max-width: 900px)').matches) {
        requestAnimationFrame(() => {
          const iframes = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'));
          const targetIframe = iframes.find((f) => f.contentWindow === e.source);
          if (targetIframe) {
            targetIframe.style.height = `${Math.ceil(e.data.height)}px`;
          }
        });
      }
    }
  });
}

// === Dock height measurement ===
function initDockObserver(): void {
  const dock = document.querySelector<HTMLElement>('.dock');
  const stage = document.querySelector<HTMLElement>('.desktop__stage');
  if (!dock || !stage) return;

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      stage.style.setProperty('--dock-height', `${Math.ceil(entry.contentRect.height)}px`);
    }
  });
  ro.observe(dock);
}

// === Boot ===
function init(): void {
  initClock();
  initStacking();
  initDrag();
  initClose();
  initIframeMessaging();
  initDockObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

Key implementation details:
- The `isDragging` flag prevents height messages during drag.
- The `pointerdown` handler on `[data-window-handle]` sets `setPointerCapture` so the pointer stays captured even over iframes.
- The `transitionend`/`prefers-reduced-motion` consideration: if there's a 120ms open transition, it's CSS-only and the script doesn't need to handle it, but it must respect `prefers-reduced-motion` by not adding JS-driven transitions.
- The `focusin` raiser must not infinite-loop: check if the window is already the highest z-index before incrementing.
- All queries are scoped to `document.querySelectorAll` and null-checked.

- [ ] **7b. Verify** — `npm run check` passes. `npm run build` succeeds. Manually open the built site (`npx astro preview --port 4321`) and confirm:
  - Clock shows `HH:MM` format.
  - Clicking a background window raises it.
  - Dragging a title bar moves the window.
  - Closing About on Home hides the window and focuses the Home dock link.
  - Clicking inside an iframe raises its window.

**Commit:** `feat: add desktop.ts client script for clock, drag, stack, close, and iframe messages`

---

## Task 8: Global CSS — desktop, dock, windows, apps, and responsive rules

**Why now:** All HTML structure exists. Styles make it visible and correct.

**Files:**
- Rewrite: `src/styles/global.css`
- Create: `public/favicon.svg`

### Steps

- [ ] **8a. Rewrite `src/styles/global.css`:**

The existing file has 479 lines. The rewrite keeps the reusable parts (tokens, reset, prose, post-card, focus, links) and replaces/adds the desktop-specific sections. Organize as:

**Section 1 — Tokens** (keep and extend):
```css
:root {
  /* Existing — keep */
  --color-text: #1a1a1a;
  --color-muted: #555;
  --color-accent: #a52a2a;
  --color-link: #0000ee;
  --color-window: #c0c0c0;
  --color-window-bar: #06068e;
  /* New */
  --desktop-bg: #f1ede1;
  --desktop-grid: rgb(26 26 26 / 0.05);
  --font-body: var(--font-geist-pixel), 'SerenityOS Emoji', system-ui, sans-serif;
  --font-display: var(--font-dotemp), 'SerenityOS Emoji', 'Courier New', monospace;
  --dock-height: 52px; /* fallback; overwritten by ResizeObserver */
}
```

Remove `--color-card`, `--container`, `--gutter`, `--section-space`, `--radius` — no longer used.

**Section 2 — SerenityOS Emoji @font-face:**
```css
@font-face {
  font-family: 'SerenityOS Emoji';
  src: url('../assets/fonts/SerenityOS-Emoji.ttf') format('truetype');
  font-display: swap;
  unicode-range: U+231A-1FAF6; /* broad emoji range */
}
```

**Section 3 — Reset** (keep existing `*`, `body`, `img`, `[hidden]`, `a`, `:focus-visible`). Update `body`:
```css
body {
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 0.9rem;
}
```

Remove `display: flex; flex-direction: column; min-height: 100vh; background-color: #fff;` from body — the desktop layout handles this.

**Section 4 — Visually hidden:**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Section 5 — Skip link** (keep existing, update z-index to `1000`).

**Section 6 — Desktop background:**
```css
.desktop {
  position: relative;
  min-height: 100dvh;
  background-color: var(--desktop-bg);
  background-image:
    linear-gradient(to right, var(--desktop-grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--desktop-grid) 1px, transparent 1px);
  background-size: 16px 16px;
}

@media (min-width: 901px) {
  .desktop {
    height: 100dvh;
    overflow: hidden;
  }
}
```

**Section 7 — Desktop stage:**
```css
.desktop__stage {
  padding: 1rem 1rem calc(var(--dock-height) + 1.5rem);
}

@media (min-width: 901px) {
  .desktop__stage {
    position: relative;
    width: 100%;
    height: 100%;
    padding-bottom: calc(var(--dock-height) + 1rem);
  }
}
```

**Section 8 — Desktop window chrome:**
```css
.desktop-window {
  background: var(--color-window);
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #000;
  border-bottom: 2px solid #000;
  box-shadow:
    inset 1px 1px 0 #dfdfdf,
    inset -1px -1px 0 #808080,
    4px 4px 0 rgb(0 0 0 / 0.25);
}

@media (min-width: 901px) {
  .desktop-window {
    position: absolute;
  }
}

/* Mobile: stack vertically */
@media (max-width: 900px) {
  .desktop-window {
    position: static;
    width: 100% !important;
    height: auto !important;
    margin-bottom: 1rem;
  }
}

.desktop-window__bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: 22px;
  padding: 0 2px 0 4px;
  background: #808080;
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.8rem;
  cursor: default;
  user-select: none;
}

.desktop-window__bar--focused {
  background: var(--color-window-bar);
}

.desktop-window__title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desktop-window__close {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 14px;
  padding: 0;
  background-color: #c0c0c0;
  color: #000;
  cursor: pointer;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
  box-shadow:
    inset -1px -1px 0 #808080,
    inset 1px 1px 0 #dfdfdf;
}

.desktop-window__close:active {
  border-top: 1px solid #000;
  border-left: 1px solid #000;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
  box-shadow:
    inset 1px 1px 0 #808080,
    inset -1px -1px 0 #dfdfdf;
}

.desktop-window__pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 14px;
  color: #fff;
  opacity: 0.7;
}

.desktop-window__body {
  background: #fff;
  border-top: 1px solid #808080;
  border-left: 1px solid #808080;
  border-right: 1px solid #dfdfdf;
  border-bottom: 1px solid #dfdfdf;
  margin: 2px;
  overflow: auto;
}

.desktop-window__body iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 900px) {
  .desktop-window__body iframe {
    height: 32rem; /* fallback; overwritten by papi:height */
  }
}

.desktop-window__status {
  padding: 1px 4px;
  margin: 0 2px 2px;
  background: var(--color-window);
  border-top: 1px solid #808080;
  border-left: 1px solid #808080;
  border-right: 1px solid #dfdfdf;
  border-bottom: 1px solid #dfdfdf;
  color: var(--color-muted);
  font-family: var(--font-display);
  font-size: 0.65rem;
  text-align: center;
}
```

**Section 9 — Per-window sizing** (desktop only, `@media (min-width: 901px)`):
```css
/* Home composition */
.window--about-home {
  left: 5vw;
  top: 12vh;
  width: min(30rem, 42vw);
  height: min(36rem, 70vh);
}
.window--photos-home {
  left: calc(100% - 6vw - min(29rem, 40vw));
  top: 17vh;
  width: min(29rem, 40vw);
  height: min(25rem, 52vh);
}

/* Single-app windows */
.window--single {
  left: 50%;
  top: 12vh;
  transform: translateX(-50%);
  width: min(42rem, calc(100vw - 4rem));
  height: min(70vh, 40rem);
}

/* Post window */
.window--post {
  left: 50%;
  top: 8vh;
  transform: translateX(-50%);
  width: min(52rem, calc(100vw - 2rem));
  height: min(44rem, 78vh);
}
```

**Section 10 — Dock:**
```css
.dock {
  position: fixed;
  left: 50%;
  bottom: max(0.75rem, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 2px 4px;
  background: var(--color-window);
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #000;
  border-bottom: 2px solid #000;
  box-shadow:
    inset 1px 1px 0 #dfdfdf,
    inset -1px -1px 0 #808080,
    0 4px 12px rgb(0 0 0 / 0.15);
  border-radius: 4px;
}

.dock__apps ul {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dock__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--color-window);
  color: #000;
  text-decoration: none;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
  box-shadow:
    inset -1px -1px 0 #808080,
    inset 1px 1px 0 #dfdfdf;
  position: relative;
}

.dock__button:hover {
  color: #000;
}

/* Tooltip */
.dock__button::after {
  content: attr(aria-label);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 6px;
  background: #ffffcc;
  color: #000;
  font-family: var(--font-body);
  font-size: 0.7rem;
  white-space: nowrap;
  border: 1px solid #000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 120ms;
}

.dock__button:hover::after,
.dock__button:focus-visible::after {
  opacity: 1;
}

/* Active state */
.dock__button--active {
  background: #d4d0c8;
  border-top: 1px solid #000;
  border-left: 1px solid #000;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
  box-shadow:
    inset 1px 1px 0 #808080,
    inset -1px -1px 0 #dfdfdf;
}

.dock__button--active::before {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 3px;
  right: 3px;
  height: 2px;
  background: var(--color-accent);
}

/* Clock */
.dock__clock {
  display: flex;
  align-items: center;
  padding: 0 6px;
  margin-left: 4px;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  border-top: 1px solid #808080;
  border-left: 1px solid #808080;
  border-right: 1px solid #dfdfdf;
  border-bottom: 1px solid #dfdfdf;
}

@media (max-width: 360px) {
  .dock {
    padding: 2px 2px;
  }
  .dock__button {
    width: 32px;
    height: 32px;
  }
}
```

**Section 11 — App document styles:**
```css
[data-app-doc] {
  background: #fff;
}

[data-embedded] .app-escape {
  display: none;
}

.app-escape {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.app-content {
  padding: 1rem 1.25rem;
}

.app-kicker {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-muted);
}

.about-title {
  margin: 0;
  font-family: var(--font-body);
  font-size: clamp(2.5rem, 12vw, 5rem);
  font-weight: 400;
  line-height: 0.9;
}

.about-title__accent {
  display: block;
  margin-left: clamp(3.5rem, 26%, 8rem);
  color: var(--color-accent);
  font-family: var(--font-display);
  font-style: italic;
  font-weight: bold;
}

.about-name {
  margin: 1rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-style: italic;
  font-weight: 800;
  text-decoration: underline;
}

.about-bio {
  max-width: 68ch;
  margin-top: 1.5rem;
  line-height: 1.65;
}

.about-bio p {
  margin: 0 0 1em;
}

.about-footer {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid var(--color-accent);
}

.about-credits {
  margin-top: 2rem;
  color: var(--color-muted);
  font-size: 0.75rem;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.photo-grid__image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 2px solid var(--color-text);
}

.photo-status {
  margin: 0.5rem 0 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

.photo-ig {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
}

.projects-list {
  display: grid;
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.projects-list a,
.projects-list span {
  font-family: var(--font-display);
  font-size: 1rem;
}

.contact-list {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.contact-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rss-url {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 0.5rem;
  background: #f4f4f4;
  border: 1px solid #ccc;
  font-size: 0.8rem;
}

.rss-url code {
  flex: 1;
  word-break: break-all;
}

.rss-url button {
  padding: 0.25rem 0.5rem;
  background: var(--color-window);
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.75rem;
}

.app-lede {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
}

.app-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid var(--color-accent);
}

.empty-state {
  margin: 2rem 0;
  color: var(--color-muted);
  font-style: italic;
}
```

**Section 12 — Post in window** (keep existing `.post__back`, `.post__title`, `.post__meta`, `.post__lede`, `.prose` rules, scoped inside `.post-article`). Adapt max-width to `68ch`, remove `padding-block: var(--section-space)` (the window provides padding). Keep `.prose` rules unchanged.

**Section 13 — 404:**
```css
.not-found-body {
  padding: 2rem;
  text-align: center;
}

.not-found__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 4rem;
}

.not-found__text {
  margin: 1rem 0;
  color: var(--color-muted);
}
```

**Section 14 — Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
}
```

**Section 15 — Drag state:**
```css
.desktop--dragging iframe {
  pointer-events: none;
}
```

**Remove old sections:** `.site-header`, `.site-header__inner`, `.site-header__brand`, `.site-nav`, `.site-footer`, `.site-footer__inner`, `.hero`, `.hero__title`, `.hero__title-accent`, `.hero__name`, `.hero__bio`, `.section`, `.section__title`, `.section__heading`, `.section__more`, `.card-grid`, `.card`, `.card__image`, `.card__body`, `.card__title`, `.card__text`, `.window`, `.window__bar`, `.window__title`, `.window__close`, `.window__body`, `.window__icon`, `.projects`, `.projects__link`, `.projects__name`, `.blog-index`, `.page-title`, `.page-lede`.

Keep and reskin: `.accent`, `.post-list`, `.post-card`, `.post-card__meta`, `.post-card__title`, `.post-card__description`, `.post__back`, `.back-link`, `.post__title`, `.post__meta`, `.post__lede`, `.prose` (all prose sub-rules).

- [ ] **8b. Create `public/favicon.svg`:**

A 16×16 pixel flower: five red (`#a52a2a`) petals around a yellow (`#f0c040`) center on a transparent background. Use `<rect>` elements with `shape-rendering="crispEdges"`. The flower is roughly:
- Center dot at `(7,7)` and `(8,7)` and `(7,8)` and `(8,8)` in yellow.
- Five petal clusters: top `(7,4)-(8,5)`, right `(10,7)-(11,8)`, bottom `(7,10)-(8,11)`, left `(4,7)-(5,8)`, top-right `(10,5)-(11,6)` — each 2×2 red.

This replaces the existing pixel "M" favicon.

- [ ] **8c. Verify** — `npm run build` passes. Open `npx astro preview --port 4321` and visually confirm:
  - Desktop background is warm paper with grid lines.
  - Dock is centered at bottom with raised bevel.
  - Windows have correct chrome, navy focused bar, gray unfocused.
  - About "Me!" on separate line with red accent and right offset.
  - Photos grid shows 2×2 images with pixel borders.
  - No horizontal overflow at 320px.

**Commit:** `feat: add global CSS for desktop, dock, windows, and apps; replace favicon`

---

## Task 9: Emoji pipeline, SerenityOS font, and licensing

**Why now:** The design requires pixel emoji and proper attribution.

**Files:**
- Create: `scripts/extract-pixel-emojis.mjs`, `src/components/ui/PixelEmoji.astro`, `THIRD_PARTY_NOTICES.md`, `public/licenses/PixelTwemoji.txt`, `public/licenses/SerenityOS-Emoji.txt`
- Add: `src/assets/fonts/SerenityOS-Emoji.ttf`, `src/assets/emoji/*.svg`

### Steps

- [ ] **9a. Create `scripts/extract-pixel-emojis.mjs`:**

A Node.js script that:
1. Reads a PixelTwemojiMC-18 v8.0 sprite sheet PNG and `default.json` mapping.
2. For each emoji in a small manifest array (initially just `🤑` — U+1F911), extracts the 18×18 cell from the sprite sheet.
3. Groups horizontal pixel runs by color and writes `<rect>`-based SVG files into `src/assets/emoji/`.
4. The script is run manually (`node scripts/extract-pixel-emojis.mjs`); generated SVGs are committed. The build never downloads emoji assets.

For v1, the manifest is minimal. The existing `🤑` is the only emoji used in content. Add a few more only if About/Photos content uses them.

**Important:** The sprite sheet is NOT committed. Only the extracted SVGs are. The script + manifest are committed so future emoji can be re-extracted.

If the sprite sheet is not available at implementation time, hand-draw the `🤑` emoji as a simple 18×18 pixel SVG (money-face) and commit it directly. Document the process in a comment.

- [ ] **9b. Create `src/components/ui/PixelEmoji.astro`:**

Props: `emoji: string` (emoji character), `alt?: string`, `inline?: boolean` (default true).

Look up the emoji's codepoint, find the corresponding SVG in `src/assets/emoji/`. Render inline `<img>` at 18×18 aligned to text baseline with `alt` and `role="img"`. If no SVG exists, render the raw character (SerenityOS Emoji font will catch it).

- [ ] **9c. Obtain SerenityOS Emoji font:**

Download `SerenityOS-Emoji.ttf` from the SerenityOS project (BSD-2-Clause). Place at `src/assets/fonts/SerenityOS-Emoji.ttf`. The `@font-face` in global.css (Task 8) already references it.

If the font cannot be downloaded during implementation, create a placeholder empty TTF and document the dependency. The font is a fallback — the site works without it.

- [ ] **9d. Create licensing files:**

`THIRD_PARTY_NOTICES.md`:
```markdown
# Third-Party Notices

## PixelTwemoji

- **Source:** [AmberWat/PixelTwemojiMC-18](https://github.com/AmbertWat/PixelTwemojiMC-18) v8.0
- **License:** CC BY 4.0
- **Modifications:** Sprite sheet converted to individual SVG files.
- **Full license:** `public/licenses/PixelTwemoji.txt`

## SerenityOS Emoji

- **Source:** [SerenityOS](https://github.com/SerenityOS/serenity)
- **License:** BSD-2-Clause
- **Modifications:** Font file extracted and self-hosted.
- **Full license:** `public/licenses/SerenityOS-Emoji.txt`
```

`public/licenses/PixelTwemoji.txt`: CC BY 4.0 full text with attribution header.

`public/licenses/SerenityOS-Emoji.txt`: BSD-2-Clause full text with copyright line.

- [ ] **9e. Verify** — `npm run build` passes. The emoji font `@font-face` is present in the built CSS. The license files are in `dist/MazenGarden/licenses/`.

**Commit:** `feat: add emoji pipeline, SerenityOS font, and licensing`

---

## Task 10: Metadata, feeds, sitemap, config, and README

**Why now:** All routes exist. Update metadata and ensure crawlers see the right data.

**Files:**
- Edit: `astro.config.mjs`, `src/pages/rss.xml.ts`, `package.json`, `README.md`
- Delete: `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/PhotoCard.astro`, `src/components/ProjectsWindow.astro`, `src/components/PostCard.astro` (the old location; the new one is at `src/components/ui/PostCard.astro`)

### Steps

- [ ] **10a. Update `astro.config.mjs` — sitemap filter:**

Add a `filter` to the sitemap integration to exclude `/apps/*`:

```js
integrations: [
  sitemap({
    filter: (page) => !page.includes('/apps/'),
  }),
],
```

Keep fonts, site, base, trailingSlash, output unchanged.

- [ ] **10b. Update `src/pages/rss.xml.ts`:**

The file already uses `SITE_TITLE` and `SITE_DESCRIPTION` from consts. Since Task 1 updates those constants, the feed title and description update automatically. Verify the RSS alternate link title in `DesktopLayout` is `Papi's Artistic Garden RSS`.

- [ ] **10c. Update `package.json`:**

Change `"name"` from `"mazengarden"` to `"papis-artistic-garden"`. This does not affect scripts or deployment.

- [ ] **10d. Delete old components:**

Remove files that are no longer imported by any page:
- `src/components/SiteHeader.astro`
- `src/components/SiteFooter.astro`
- `src/components/PhotoCard.astro`
- `src/components/ProjectsWindow.astro`
- `src/components/PostCard.astro` (old location only — `src/components/ui/PostCard.astro` stays)

Before deleting, grep the codebase to confirm no file imports them.

- [ ] **10e. Rewrite `README.md`:**

New sections:
- **Papi's Artistic Garden** — what the site is, the desktop metaphor.
- **Architecture** — desktop shell, iframe apps, blog exception, static output.
- **Routes** — table of shell routes and app documents.
- **Adding an app** — registry entry + shell route + app page + app component + icon + test.
- **Emoji and licensing** — PixelTwemoji, SerenityOS, where notices live.
- **Development** — `npm install`, `npm run dev`, `npm run build`, `npm run check`, `npm run test:e2e`, `npm run format`.
- **Deployment** — GitHub Pages, base path, no push by agent.

- [ ] **10f. Verify** — `npm run build` passes. Check `dist/MazenGarden/sitemap-0.xml`:
  - Contains `/`, `/photos/`, `/projects/`, `/blog/`, `/contact/`, `/rss/`, `/blog/hello-world/`.
  - Does NOT contain any `/apps/*` URLs.
  - Does NOT contain `/404.html`.
  Check `dist/MazenGarden/rss.xml`: title is `Papi's Artistic Garden`.

**Commit:** `chore: update metadata, feeds, sitemap filter, package name, and README`

---

## Task 11: Rewrite Playwright tests

**Why now:** All product code is complete. Rewrite the full test suite against the new desktop.

**Files:**
- Rewrite: `tests/shell.spec.ts`, `tests/home.spec.ts`, `tests/projects.spec.ts`, `tests/layout.spec.ts`, `tests/blog.spec.ts`, `tests/feeds.spec.ts`, `tests/smoke.spec.ts`, `tests/screenshots.spec.ts`

### Steps

- [ ] **11a. Rewrite `tests/shell.spec.ts` — Desktop shell and dock:**

```ts
test('the desktop renders with dock, no header or footer', async ({ page }) => {
  await page.goto('./');
  expect(await page.locator('.desktop').count()).toBe(1);
  expect(await page.locator('.site-header').count()).toBe(0);
  expect(await page.locator('.site-footer').count()).toBe(0);
});

test('the dock has exactly six app links and a clock', async ({ page }) => {
  await page.goto('./');
  const dock = page.locator('.dock');
  const links = dock.locator('.dock__button');
  await expect(links).toHaveCount(6);

  // Each link has an accessible name and a /MazenGarden/ href
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('aria-label', /.+/);
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/MazenGarden\//);
  }

  // Clock
  const clock = dock.locator('[data-clock]');
  await expect(clock).toHaveCount(1);
  await expect(clock).toHaveText(/^\d{2}:\d{2}$/);
});

test('active dock state follows the route', async ({ page }) => {
  // Home
  await page.goto('./');
  await expect(page.locator('.dock__button--active')).toHaveCount(1);
  await expect(page.locator('.dock__button--active')).toHaveAttribute('aria-label', 'Home');

  // Writing
  await page.goto('./blog/');
  await expect(page.locator('.dock__button--active')).toHaveAttribute('aria-label', 'Writing');

  // Post — Writing is active with aria-current="location"
  await page.goto('./blog/hello-world/');
  const active = page.locator('.dock__button--active');
  await expect(active).toHaveAttribute('aria-label', 'Writing');
  await expect(active).toHaveAttribute('aria-current', 'location');
});
```

- [ ] **11b. Rewrite `tests/home.spec.ts` — Home composition:**

```ts
test('home has About and Photos windows', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('[data-window-id="about"]')).toBeVisible();
  await expect(page.locator('[data-window-id="photos"]')).toBeVisible();
});

test('Photos on Home is pinned with no close button', async ({ page }) => {
  await page.goto('./');
  const photos = page.locator('[data-window-id="photos"]');
  await expect(photos.locator('[data-window-close]')).toHaveCount(0);
  await expect(photos.locator('.desktop-window__pin')).toHaveCount(1);
  await expect(photos.locator('.desktop-window__status')).toContainText('always open');
});

test('About iframe has the heading and bio', async ({ page }) => {
  await page.goto('./');
  const aboutFrame = page.frameLocator('[data-window-id="about"] iframe');
  await expect(aboutFrame.locator('h1')).toContainText('About');
  await expect(aboutFrame.locator('.about-title__accent')).toContainText('Me!');
  await expect(aboutFrame.locator('.about-name')).toContainText('Mazen Ragab');
  // Five bio paragraphs
  const bioPs = aboutFrame.locator('.about-bio p');
  await expect(bioPs).toHaveCount(5);
});

test('Photos iframe has four images with alt text', async ({ page }) => {
  await page.goto('./');
  const photosFrame = page.frameLocator('[data-window-id="photos"] iframe');
  const images = photosFrame.locator('.photo-grid__image');
  await expect(images).toHaveCount(4);
  for (const img of await images.all()) {
    await expect(img).toHaveAttribute('alt', /.+/);
  }
});

test('About window is closable', async ({ page }) => {
  await page.goto('./');
  const about = page.locator('[data-window-id="about"]');
  await about.locator('[data-window-close]').click();
  await expect(about).toBeHidden();
});
```

- [ ] **11c. Rewrite `tests/projects.spec.ts` — Projects window:**

```ts
test('the projects page lists projects', async ({ page }) => {
  await page.goto('./projects/');
  const projectsFrame = page.frameLocator('[data-window-id="projects"] iframe');
  await expect(projectsFrame.locator('h1')).toContainText('Projects');
  await expect(projectsFrame.getByRole('link', { name: 'EmadEats Project' })).toHaveAttribute(
    'href', 'https://emadeats.vercel.app',
  );
  const text = await projectsFrame.locator('body').innerText();
  expect(text).toContain('BuggyEyes');
  expect(text).toContain('Sudany');
});
```

- [ ] **11d. Rewrite `tests/blog.spec.ts` — Blog/post routes:**

```ts
test('/blog/ renders the Writing window with the published post', async ({ page }) => {
  await page.goto('./blog/');
  const writingFrame = page.frameLocator('[data-window-id="writing"] iframe');
  await expect(writingFrame.locator('h1')).toContainText('Writing');
  await expect(writingFrame.getByRole('link', { name: 'Hello, world' })).toBeVisible();
});

test('post links from Writing iframe navigate to real post URL', async ({ page }) => {
  await page.goto('./blog/');
  const writingFrame = page.frameLocator('[data-window-id="writing"] iframe');
  await writingFrame.getByRole('link', { name: 'Hello, world' }).click();
  await page.waitForURL('**/blog/hello-world/');
  // Post is in the parent document, not an iframe
  await expect(page.locator('.post-article h1')).toContainText('Hello, world');
});

test('post page has correct canonical and title', async ({ page }) => {
  const response = await page.goto('./blog/hello-world/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Hello, world.*Papi/);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toContain('/MazenGarden/blog/hello-world/');
});

test('post window is pinned', async ({ page }) => {
  await page.goto('./blog/hello-world/');
  const postWindow = page.locator('[data-window-id="post"]');
  await expect(postWindow.locator('[data-window-close]')).toHaveCount(0);
  await expect(postWindow.locator('.desktop-window__pin')).toHaveCount(1);
});
```

- [ ] **11e. Rewrite `tests/feeds.spec.ts` — RSS, sitemap, robots:**

```ts
test('RSS feed has the new title and valid post links', async ({ page }) => {
  const response = await page.goto('./rss.xml');
  expect(response?.status()).toBe(200);
  const xml = await page.content();
  expect(xml).toContain('Papi\u2019s Artistic Garden');
  expect(xml).toContain('/MazenGarden/blog/hello-world/');
});

test('sitemap includes shell routes and excludes /apps/', async ({ page }) => {
  const response = await page.goto('./sitemap-0.xml');
  expect(response?.status()).toBe(200);
  const xml = await page.content();
  expect(xml).toContain('/MazenGarden/');
  expect(xml).toContain('/MazenGarden/blog/');
  expect(xml).toContain('/MazenGarden/photos/');
  expect(xml).not.toContain('/apps/');
});

test('404 returns the desktop 404 and is noindex', async ({ page }) => {
  const response = await page.goto('./nonexistent-page/');
  // Note: static server may return 200 for 404.html — check for content
  await expect(page.locator('.not-found__title')).toContainText('404');
  const noindex = await page.locator('meta[name="robots"][content="noindex"]').count();
  expect(noindex).toBe(1);
});
```

- [ ] **11f. Rewrite `tests/layout.spec.ts` — Responsive and asset checks:**

Keep the structure of tracking same-origin responses. Update assertions:
- No `.site-header` or `.site-footer`.
- `.desktop` exists.
- No runtime Google Fonts requests.
- All same-origin requests start with `/MazenGarden/` and return 200.
- Every page has one `h1` in its own document.
- Every iframe has a `title`.
- Every image has `alt` text.
- No horizontal overflow at viewports: 320×568, 390×844, 768×1024, 1280×900.
- Dock links are at least 32×32 CSS pixels at 320px.

- [ ] **11g. Rewrite `tests/smoke.spec.ts` — Basic route smoke:**

Test that each of the main routes returns 200: `/`, `/photos/`, `/projects/`, `/blog/`, `/contact/`, `/rss/`, `/blog/hello-world/`.

Also test each app document: `/apps/about/`, `/apps/photos/`, `/apps/projects/`, `/apps/writing/`, `/apps/contact/`, `/apps/rss/` — each returns 200 and has a canonical pointing to its shell route.

- [ ] **11h. Rewrite `tests/screenshots.spec.ts`:**

Capture screenshots at 1280×900 and 390×844 into `tests/.artifacts/` for human inspection. Pages: Home, `/blog/`, `/blog/hello-world/`, `/projects/`.

- [ ] **11i. Add window interaction tests** (can be in `tests/shell.spec.ts` or a new `tests/windows.spec.ts`):

```ts
test('clicking a background window raises it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');
  const about = page.locator('[data-window-id="about"]');
  const photos = page.locator('[data-window-id="photos"]');
  // Click photos to raise it
  await photos.locator('.desktop-window__bar').click();
  const photosZ = await photos.evaluate((el) => getComputedStyle(el).zIndex);
  const aboutZ = await about.evaluate((el) => getComputedStyle(el).zIndex);
  expect(Number(photosZ)).toBeGreaterThan(Number(aboutZ));
});

test('close hides window and focuses dock link', async ({ page }) => {
  await page.goto('./');
  const about = page.locator('[data-window-id="about"]');
  await about.locator('[data-window-close]').click();
  await expect(about).toBeHidden();
  // Focus should be on the Home dock link
  const focused = page.locator(':focus');
  await expect(focused).toHaveAttribute('aria-label', 'Home');
});

test('no uncaught errors during window interactions', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  // Click around
  await page.locator('[data-window-id="photos"] .desktop-window__bar').click();
  await page.locator('[data-window-id="about"] [data-window-close]').click();
  expect(errors).toHaveLength(0);
});
```

- [ ] **11j. Verify** — `npm run build && npx playwright test` — all tests pass.

**Commit:** `test: rewrite Playwright suite for desktop redesign`

---

## Task 12: Final verification, formatting, and commit

**Why now:** All code and tests are complete. Final quality gate.

**Files:**
- Edit: any files that fail formatting or type checks.

### Steps

- [ ] **12a. Run `npm run format`** — fix any formatting issues.

- [ ] **12b. Run `npm run format:check`** — must pass (exit 0).

- [ ] **12c. Run `npm run check`** — Astro type check must pass.

- [ ] **12d. Run `npm run build`** — must produce a clean build.

- [ ] **12e. Run `npm run test:e2e`** — all Playwright tests must pass.

- [ ] **12f. Inspect built output:**
  - `dist/MazenGarden/index.html` — desktop with two windows, dock.
  - `dist/MazenGarden/apps/about/index.html` — bare app doc with canonical to `/`.
  - `dist/MazenGarden/blog/hello-world/index.html` — post content in parent document.
  - `dist/MazenGarden/rss.xml` — new title.
  - `dist/MazenGarden/sitemap-0.xml` — no `/apps/` URLs.
  - `dist/MazenGarden/licenses/` — both license files present.
  - `dist/MazenGarden/favicon.svg` — pixel flower.

- [ ] **12g. Visual QA at 1280×900 and 390×844:**
  - Desktop background, dock, windows render correctly.
  - Drag works on desktop, disabled on mobile.
  - About "Me!" is on its own line with the red accent and right offset.
  - Photos grid shows 2×2 images.
  - Post page has article content directly in the page (not just in an iframe).
  - 320px: no horizontal overflow, dock buttons ≥ 32px.

- [ ] **12h. Final commit** — `npm run format && git add -A && git commit -m "feat: Papi's Artistic Garden desktop redesign"`

If individual tasks were committed separately, this step is a no-op. If any fixups were needed, amend or add a fixup commit.

---

## Dependency Graph

```
Task 1 (data)
  └→ Task 2 (PixelIcon)
       └→ Task 3 (shell components: DesktopLayout, Dock, Window)
            ├→ Task 4 (AppLayout + app content + PostWindow)
            │    └→ Task 5 (app document pages)
            │         └→ Task 6 (shell routes)
            └→ Task 7 (desktop.ts — can parallel with 4–6)
                 └→ Task 8 (CSS + favicon)
                      └→ Task 9 (emoji + licensing)
                           └→ Task 10 (metadata + cleanup)
                                └→ Task 11 (tests)
                                     └→ Task 12 (final verification)
```

**Parallelizable pairs:**
- Tasks 4+7 can run in parallel (app content and client script are independent).
- Tasks 9+10 can run in parallel (emoji/licensing and metadata/cleanup are independent).
- Test writing (Task 11) can start as soon as Tasks 8–10 are complete.

## Execution Notes

- Each task is one commit. Tasks 1–3 are sequential (each depends on the prior). Tasks 4 and 7 can be parallelized. Tasks 5–6 depend on 4. Tasks 8–10 are sequential but 9 and 10 can be parallelized after 8.
- The biggest risk is CSS: Task 8 is the largest single task and touches the most visual surface. Budget extra time for it.
- If the SerenityOS Emoji TTF or PixelTwemoji sprite sheet can't be obtained, stub them and document the dependency. The site works without either — they are fallbacks and accents.
- The old Playwright tests will fail from Task 6 onward. That is expected. Do not patch old tests to pass on the new structure; replace them entirely in Task 11.
