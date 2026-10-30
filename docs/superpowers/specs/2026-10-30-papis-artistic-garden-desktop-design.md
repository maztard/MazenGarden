# Papi’s Artistic Garden: retro desktop redesign

**Date:** 2026-10-30
**Status:** Approved — 2026-10-30
**Scope:** Project
**Repo:** `D:\personalweb-copy` (copy of `maztard/MazenGarden`)

## Intent

The current site is a conventional scrolling page with a retro skin. The redesign should make the retro desktop itself the product: a warm paper desktop, a Win95-style dock floating at the bottom, and real application windows that can be dragged, stacked, and brought forward. The landing view is a two-window composition: an About window beside an always-open Photos window showing pictures of Mazen as a person.

The site also gets a new public identity: **Papi’s Artistic Garden**. The repo, deployment URL, and `/MazenGarden` base path stay as they are; only the visible name, browser titles, feed title, and README change.

Success looks like: a visitor lands on a desktop that feels unmistakably personal and pixel-made, can open each program from the dock, can move and stack the windows, can read posts at their existing real URLs, and can still subscribe to the feed and find every page through the sitemap.

## Goals

- Replace the current header/hero/card page with a full-viewport retro desktop.
- Put a rectangular, bottom-center, Win95 taskbar dock on every desktop page.
- Make each app a separate small HTML page loaded inside an iframe-backed window.
- Make desktop windows draggable, stackable, and click-to-front.
- Land on About content beside an always-open Photos app in the same view.
- Preserve the About/Me! heading as two lines, with “Me!” keeping its right-hand horizontal offset.
- Rename the visible site to **Papi’s Artistic Garden** and remove the top “MazenGarden” title.
- Keep the existing retro typefaces, red accent, pixel-art character, and dark-red link hover.
- Make the dock data-driven and responsive so adding a seventh app is a registry entry plus a route, not a layout rewrite.
- Keep blog posts at `/blog/[slug]/`, with real server-rendered post HTML, RSS, sitemap, and deep links.
- Use pixel SVG icons for all UI glyphs and pixel emoji art for emojis.
- Preserve static Astro output and GitHub Pages deployment under `/MazenGarden/`.

## Non-goals

- No window resizing, minimize/maximize, snap-to-edge, tiling, multiple instances, or position persistence.
- No desktop icons, Start menu, context menus, fake menu bars, or nonfunctional window chrome.
- No client-side SPA router or history rewriting.
- No CMS, comments, search, tags, pagination, analytics, newsletter, or contact-form backend.
- No dark mode, glassmorphism, rounded “modern app” dock, or mobile-native app redesign.
- No rewrite of the bio voice or blog content.
- No change to the repo name, GitHub Pages URL, or `/MazenGarden` base path.
- No new project URLs; BuggyEyes and Sudany remain non-links.
- No visual-regression snapshots; screenshots remain for human inspection.
- No push to `origin` and no GitHub settings changes by the agent.

## Anti-goals

- A Windows 95 pastiche where chrome and dead controls overwhelm the actual writing and photos.
- A desktop that only works with a mouse; all content must remain reachable by keyboard and touch.
- An app architecture that hides the blog from crawlers or breaks existing post URLs.
- A dock that fits today’s six apps but needs a redesign when more are added.
- Emoji that fall back to the visitor’s platform emoji in normal content.
- A mobile layout that produces horizontal scrolling or a dock that covers the last window.
- A site that requires JavaScript just to read the About copy or a blog post.

## Constraints

- Astro 7.4.3, static output, TypeScript strict, npm, Astro content collections.
- Existing deployment is `https://maztard.github.io/MazenGarden/` with `base: '/MazenGarden'` and `trailingSlash: 'always'`.
- No server runtime. All routes are prebuilt HTML.
- All internal URLs must go through `withBase()`; iframe `src` values are the most likely place to forget it.
- Fonts must remain self-hosted at runtime. The Astro Fonts API downloads Geist Pixel at build time; no runtime Google Fonts requests.
- The iframe documents are same-origin and static. They are trusted site content, not third-party embeds.
- Existing blog URLs, `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`, and `/404.html` must keep working.
- The site must not develop page-level horizontal overflow from 320px up.
- The design is intentionally light-mode and mouse/touch friendly; desktop window movement is an enhancement, not a requirement for reading.

## Current state (evidence)

- `src/pages/index.astro` currently renders a headerless hero, latest writing, four photo cards, and a closable Projects window.
- `src/layouts/BaseLayout.astro` owns the document head, SiteHeader, SiteFooter, and both fonts.
- `src/styles/global.css` already has the red accent (`#a52a2a`), body/display font variables, Win95 window colors (`#c0c0c0`, `#06068e`), and window bevel styles to build on.
- `src/components/ProjectsWindow.astro` is the only existing window; it is a static page section with a close button, not a window manager.
- `src/pages/blog/index.astro` and `src/pages/blog/[slug].astro` already provide real blog routes.
- The existing Playwright suite assumes `.site-header`, `.hero__bio`, the four photo cards, the projects section, and old titles. It must be rewritten as part of this change.
- `src/assets/images/` contains four scenic photos (`sky1`, `sky2`, `dorm1`, `random1`). One photo of Mazen has now been supplied at `src/assets/images/me/mazen-1.jpeg`; three more are still needed for the four-photo grid.
- The confirmed contact email is `mazenra100@gmail.com`. GitHub (`maztard`) and Instagram (`@papisartisticgarden`) are already known.
- Visual explorations selected: bottom floating dock, Win95 taskbar shell (option B), stacked windows, separate HTML app documents in iframes, and hybrid PixelTwemoji + SerenityOS emoji.
- The chosen mockup files live under `.superpowers/brainstorm/manual-20261030145009/content/`; they are reference material only and are not product code.

## Approaches considered

1. **Multi-page desktop shell with iframe app documents — chosen.** Every route renders the same desktop and dock. App content lives at `/apps/<app>/` and is loaded in the window iframe. Blog posts are the deliberate exception: their content is rendered directly in the post window so the canonical URL contains the article HTML.
2. **Single-page desktop with a client-side router.** One document owns all windows, routes are simulated with history APIs, and apps are mounted into iframes. This gives seamless opening and stacking, but makes deep links, canonical metadata, crawler-readable post content, and no-JS reading much harder. It also turns a content site into an application for no user benefit.
3. **Multi-page shell with all app content rendered directly, no iframes.** This is the simplest server-rendered option and has the best SEO, but it couples app markup and styles to the desktop shell, gives each app no independent document boundary, and discards the user’s chosen iframe architecture.
4. **Iframe everything, including blog posts.** Keeps one app pattern, but puts the article body only inside a child document. That weakens the blog’s primary SEO surface and makes the canonical URL less authoritative.

The chosen approach keeps app documents isolated while preserving the one content type that needs first-class HTML: the blog post. It also avoids a client router and works with GitHub Pages’ static hosting.

## Design

### Experience overview

The visitor lands on a warm, lightly gridded desktop. Two Win95 windows sit side by side near the top of the stage:

- **About Me!** on the left: the pixel “About” title, the offset red “Me!” line, Mazen’s name, and the five-paragraph bio.
- **My Photos** on the right: a pinned, always-open photo app with a 2×2 grid of pictures of Mazen and an “always open” status strip in the window chrome.

A bottom-center taskbar dock floats above the desktop. It contains six equal-sized pixel app buttons — Home, Photos, Projects, Writing, Contact, RSS — and a live clock. The active app’s button is pressed and marked with the red accent. Clicking a dock button follows a real link to that app’s route. The desktop is not a scrolling page on large screens; windows live in a fixed stage behind the dock.

On smaller screens the windows stack vertically in a normal scrolling document, the drag behavior is disabled, and each window grows to fit its app content. The dock stays pinned to the bottom.

The old “MazenGarden” header, footer, hero sections, photo-card row, and always-open Projects window are removed from the landing page. Their content moves into the relevant apps.

### Routes and URL map

| Route | Output | What opens | Notes |
|---|---|---|---|
| `/MazenGarden/` | desktop shell | About window + pinned Photos window | Home is the only two-window composition |
| `/MazenGarden/photos/` | desktop shell | Photos window | Same app, more room |
| `/MazenGarden/projects/` | desktop shell | Projects window | Replaces the old homepage Projects section |
| `/MazenGarden/blog/` | desktop shell | Writing window | Writing app lists published posts |
| `/MazenGarden/blog/[slug]/` | desktop shell | Post window | Content rendered directly in the parent document |
| `/MazenGarden/contact/` | desktop shell | Contact window | Links only; no form backend |
| `/MazenGarden/rss/` | desktop shell | RSS window | HTML subscription page; feed stays at `/rss.xml` |
| `/MazenGarden/apps/about/` | bare app document | — | iframe source; canonical to `/` |
| `/MazenGarden/apps/photos/` | bare app document | — | iframe source; canonical to `/photos/` |
| `/MazenGarden/apps/projects/` | bare app document | — | iframe source; canonical to `/projects/` |
| `/MazenGarden/apps/writing/` | bare app document | — | iframe source; canonical to `/blog/` |
| `/MazenGarden/apps/contact/` | bare app document | — | iframe source; canonical to `/contact/` |
| `/MazenGarden/apps/rss/` | bare app document | — | iframe source; canonical to `/rss/` |
| `/MazenGarden/rss.xml` | RSS 2.0 | — | Existing URL preserved |
| `/MazenGarden/sitemap-index.xml` | sitemap index | — | Existing URL preserved |
| `/MazenGarden/sitemap-0.xml` | sitemap | — | Shell routes and posts only; no `/apps/*` |
| `/MazenGarden/404.html` | desktop shell | Not-found window | `noindex` |

All routes use trailing slashes. The base path is written only in `astro.config.mjs`, `robots.txt`, tests, and the URL helper.

### Desktop shell

`src/layouts/DesktopLayout.astro` owns every desktop route:

- `<head>`: charset, viewport, per-page title, description, canonical, optional `noindex`, favicon, RSS alternate, sitemap link, and both Astro font components plus the emoji font stylesheet.
- Body: skip link → `<main class="desktop" id="desktop">` → `<div class="desktop__stage">` containing the window slot → `<DesktopDock>`.
- No header, no footer, no visible site-title bar.
- `main` has a visually hidden `h1` on app routes so each parent document has one named heading. Blog posts and 404 use their visible heading instead.
- The shell includes one small client script, `src/scripts/desktop.ts`, for the clock, window dragging, stacking, close behavior, and iframe height/focus messages.
- On viewports wider than `900px`, the desktop uses `height: 100dvh; overflow: hidden`. Below `900px`, the page becomes scrollable and the stage stacks windows in document order.
- The stage has bottom padding derived from the measured dock height so the last window is never hidden behind the dock.

### Dock

`src/components/desktop/DesktopDock.astro` renders one floating Win95 taskbar.

- Position: `position: fixed; left: 50%; bottom: max(0.75rem, env(safe-area-inset-bottom)); transform: translateX(-50%);`.
- Shell: `#c0c0c0` background, 2px raised bevel (white/`#dfdfdf` light, `#808080`/`#404040` shadow), square corners (a 4px radius at most), and a soft drop shadow under the floating bar.
- App group: a `<nav aria-label="Desktop applications">` containing a `<ul>` of six anchors. Each anchor is a `34×34` Win95 button with a 20×20 pixel SVG icon, no visible text, an `aria-label`, a CSS pixel tooltip above on hover/focus, and `title` as a native fallback.
- All app glyphs render at exactly 20×20. No text labels are placed inside the buttons.
- Active app: sunken bevel, slightly lighter gray, and a 2px red strip at the bottom. `aria-current="page"` on an index route; `aria-current="location"` on a post page for the Writing app.
- The clock is a sibling of the nav, inside the dock shell: a sunken well with `HH:MM` in 24-hour local time, tabular numerals, an accessible full-date label, and no `aria-live` announcements every minute.
- The clock renders `--:--` before JavaScript runs. The script writes the time on load and refreshes it every 15 seconds. A `<noscript>` fallback is not needed because the clock is decorative.
- The dock links are normal anchors. There is no client-side router. Clicking the current app’s dock button reloads that route; a closed window is restored by navigating with the dock.
- Responsive behavior: the app group is `display: flex` with `flex-wrap: wrap` inside a fixed-width shell limit; the clock never wraps away from the dock. At 320px the six 34px buttons and clock fit by reducing the outer padding and gaps; once a seventh app is added, the app group wraps to a second row rather than shrinking below 32px touch targets. The dock grows upward. The shell measures its own height with `ResizeObserver` and exposes it as `--dock-height` for the stage padding.
- The dock is not included in app iframe documents.

Dock order: Home, Photos, Projects, Writing, Contact, RSS, clock.

### App registry and active state

`src/data/apps.ts` is the single source for dock order and labels:

```ts
export type AppId = 'home' | 'photos' | 'projects' | 'writing' | 'contact' | 'rss';

export interface AppDefinition {
  id: AppId;
  label: string;        // visible tooltip / aria-label
  route: string;        // shell route, base-relative
  appRoute: string;     // iframe document, base-relative
  icon: string;         // pixel icon name
  windowTitle: string;
}
```

- Every dock item, active state, app route, and iframe source reads from this registry.
- Adding an app means adding a registry entry, a shell route, an app document, a pixel icon, and a test. It must not require editing the dock layout.
- Home is the exception with no app document? No: About is its app; the registry entry is `id: 'home'`, `route: '/'`, `appRoute: '/apps/about/'`, `label: 'Home'`, `windowTitle: 'About Me!'`.
- Active detection is pathname-based: Home is exact `/`; Writing is any `/blog/` path; the rest match their exact shell route.

### Window system

`src/components/desktop/DesktopWindow.astro` renders one window and accepts either an `iframeSrc` or slot content for the post/404 exception.

Markup contract:

```html
<section class="desktop-window" data-window data-window-id="photos" aria-labelledby="photos-window-title">
  <div class="desktop-window__bar" data-window-handle>
    <PixelIcon name="photos" size={16} />
    <span class="desktop-window__title" id="photos-window-title">My Photos</span>
    <button class="desktop-window__close" type="button" data-window-close aria-label="Close My Photos">…</button>
  </div>
  <div class="desktop-window__body">
    <iframe src={...} title="My Photos"></iframe>
  </div>
</section>
```

- Chrome: `#c0c0c0` body, 2px raised outer bevel, inset 1px light bevel, no rounded corners, and a 4px hard drop shadow.
- Title bar: 22px high, 2px inset, navy `#06068e` when focused and `#808080` when not; white title in Dotemp; 16px app icon; a 16×14 pixel close button on the right, or a pixel pin for pinned windows.
- Title text truncates with ellipsis when the window is narrow. The full title stays in the tooltip/accessible name.
- The only interactive window control in v1 is Close. Pinned windows replace it with a non-interactive pixel pin. No minimize or maximize buttons are shown, and no fake File/Edit menus.
- Pinned windows (Photos on Home, the post window, and the 404 window) do not render a close button. They show a non-interactive pixel pin icon in its place and a 16px sunken status strip reading “always open” across the bottom of the window chrome. The status strip is part of the window, not the app document, so the same Photos app can be closable on `/photos/` without context-specific app content.
- Home Photos and post/404 are pinned because closing the only content on a canonical URL would leave a blank page. The About window and the single-app windows for Photos, Projects, Writing, Contact, and RSS are closable.
- Windows are `position: absolute` on desktop with per-app default `left`, `top`, `width`, and `height` CSS custom properties. CSS supplies safe clamps; the default composition is:
  - Home About: left near 5vw, top near 12vh, width `min(30rem, 42vw)`, height `min(36rem, 70vh)`.
  - Home Photos: right near 6vw, top near 17vh, width `min(29rem, 40vw)`, height `min(25rem, 52vh)`.
  - Single-app routes: horizontally centered, top near 12vh, width between `32rem` and `52rem` depending on the app, height `min(70vh, app-specific max)`.
  - Post: centered, width `min(52rem, calc(100vw - 2rem))`, height `min(44rem, 78vh)`.
- Window bodies are white with a 1px sunken border. Iframe bodies have no padding; the iframe fills the body. Post/404 windows have scrollable padded content.
- Windows are siblings in the stage. Each starts at a base `z-index` of 10, ordered by route (Photos above About on Home). Pointerdown anywhere in the window chrome, `focusin`, or a validated `papi:focus` message from the window’s iframe raises it by assigning the next z-index. The focused title bar turns navy; all others turn gray.
- Dragging starts on pointerdown on the title bar, except when the target is a button. The script captures the pointer, computes the offset from the window’s top-left, and updates `left`/`top` in pixels. While dragging, all iframes get `pointer-events: none` so the pointer does not fall into an iframe. Dragging is clamped so at least 80px of the title bar remains visible horizontally and vertically.
- Dragging is enabled only above the 900px breakpoint and for fine pointers. On the stacked layout, windows are static and the drag handler exits.
- Close sets the window's `hidden` property, raises the next visible window, and moves focus to the matching dock link. Pinned windows have no close button and cannot be dismissed.
- Positions are not saved to `localStorage` or cookies. Every full page load returns to the route’s default composition.
- On resize crossing from desktop to mobile, inline positions are cleared so the CSS stack takes over. Crossing back restores the default CSS positions.
- There is no animation on window open/close beyond a possible 120ms opacity/transform on first paint; `prefers-reduced-motion: reduce` removes it.

### App documents and iframes

`src/layouts/AppLayout.astro` owns the bare app documents:

- Same document head and font setup as the desktop, but no dock, windows, or desktop background.
- Canonical link points at the shell route. App documents are intentionally not in the sitemap.
- A small “← Papi’s desktop” link at the top is visible only when the document is opened directly. A tiny inline script sets `data-embedded` when `window.self !== window.top`; CSS hides the link when embedded.
- Internal links that should leave the app use `target="_top"`. External links use `target="_blank" rel="noopener noreferrer"`.
- The app document posts `{ type: 'papi:focus' }` to its parent on pointerdown after validating the parent origin, so clicking inside an iframe raises its window.
- On stacked/mobile layouts, a `ResizeObserver` posts `{ type: 'papi:height', height }` to the parent. The shell grows the iframe and window to that height. On desktop the message is ignored and the window’s fixed height wins. If no height message arrives, mobile windows fall back to a `32rem` body height.
- Each app has a visible `h1` and starts with a one-line lede. App content is padded `1rem` to `1.25rem` and scrolls inside the iframe on desktop.
- The app document’s body has a plain white content surface. The pixel desktop background belongs to the shell, not the app.
- App documents may include tiny progressive-enhancement scripts (RSS copy button, height/focus messages); none may be required to read the page.

Iframe rules in the shell:

- All `src` values use `withBase('/apps/.../')`.
- Every iframe has a unique, human-readable `title`.
- The active window’s iframe loads eagerly. No hidden or offscreen iframes are preloaded.
- `referrerpolicy="same-origin"` is allowed but not required. No `sandbox` is used because the documents are first-party and need same-origin messaging; they contain no user-generated scripts.
- The shell listens for `message` events only when `event.origin === window.location.origin` and `event.source` matches one of its iframes.

### Home composition

`/` renders two windows:

1. **About Me!** (`/apps/about/`)
   - Window title “About Me!”; app icon: pixel flower.
   - App content: kicker “PAPI’S ARTISTIC GARDEN”; a two-line `h1` with `About` on one line and `Me!` on the next; name “Mazen Ragab aka (Maztardoo)”; the existing five bio paragraphs.
   - “Me!” is `display: block`, red, Dotemp italic/bold, with a right-hand offset of `clamp(3.5rem, 26%, 8rem)` relative to the window content. It must never rejoin the “About” line.
   - The old `clamp(2rem, 27vw, 22rem)` offset is adapted to the narrower window, not copied blindly: the visual effect is a large rightward stagger, not a fixed 22rem gap that would overflow.
   - The kicker is the only visible site-name treatment on the page; there is no top brand row.
   - Footer links: “Writing →” to `/blog/` and “Photos →” to `/photos/`, both `target="_top"`. A small credits line is allowed here.
2. **My Photos** (`/apps/photos/`)
   - Window title “My Photos”; app icon: pixel camera/photos glyph.
   - Pinned and always open on Home; the window chrome carries the pin and “always open” status.
   - App content: short header, a 2×2 grid of exactly four real photos of Mazen, and a status line “4 photos”.
   - The photo grid uses the site’s pixel-bordered frame style, square crops, and real alt text. Visible captions are omitted in v1; the alt text carries the description.
   - A link to `@papisartisticgarden` opens Instagram in a new tab.
   - If the photo set is empty, the app shows a deliberate pixel-art “No photos yet” state instead of broken images.

The About window is closable on Home. If both windows are closed, the empty desktop still shows the dock; reloading Home restores the composition.

### App content

**Photos (`/photos/`)** — the same Photos app in a larger, closable window. It uses the same four-photo data and the same 2×2 grid, simply rendered larger. No separate gallery mode, no query flags, and no context-specific app content in v1.

**Projects (`/projects/`)** — the existing “Other Projects” content: EmadEats Project as an external link, BuggyEyes and Sudany as plain text. Add a short “Things I’ve built or am building” lede and a pixel folder/cart icon. No invented descriptions or statuses.

**Writing (`/blog/`)** — the Writing app lists published posts newest first: date, linked title, and description. Title “Writing”; lede “Notes on whatever I’m curious about.” Empty state “No posts yet. Check back soon.” Post links use `postUrl(post)` and `target="_top"`. A footer link points to the RSS app. Reuse `PostCard` where practical, restyled for the window.

**Post (`/blog/[slug]/`)** — a dedicated post window titled `Writing — {post title}`. The article is server-rendered directly inside the window body, not in an iframe:
- Back link “← All writing” to `/blog/`
- `h1` post title
- `<time>` date and description lede
- Markdown body in the existing `.prose` styles
- Footer back link
- Page title `{post title} · Papi’s Artistic Garden`
- Canonical URL is the post route itself.

This exception is required for the blog’s SEO and no-JS readability. The window chrome still makes it feel like the rest of the desktop.

**Contact (`/contact/`)** — a short “Say hi or send me a project idea” lede and a list of pixel-icon links. Use the confirmed email `mazenra100@gmail.com` as a `mailto:` link, plus GitHub and Instagram. No form and no backend. External links open in a new tab.

**RSS (`/rss/`)** — explains that the garden can be read in a feed reader, shows the feed URL, offers a “Copy feed URL” button with a non-JavaScript fallback (the visible URL), and lists the latest posts with `target="_top"` links. The actual feed remains `/rss.xml`; the dock’s RSS app does not replace or wrap the XML.

**404** — a desktop shell with a single “Page not found” window, “404”, “This page wandered off.”, and a Home link. `noindex`; no app iframe.

### Blog and SEO

- Blog index and post URLs do not change.
- The Writing app document is an iframe, but posts are not. Crawlers receive the article body in the canonical post document.
- Post pages keep the existing `BlogPost` content data, date formatting, RSS description, and Markdown collection.
- The `h1` on a post page is the article title. The shell does not add a second hidden `h1` there.
- App shell routes without a visible parent-document `h1` get a visually hidden `h1` naming the app; the visible app heading lives in the iframe.
- `/blog/` remains in the sitemap; `/apps/*` is excluded.
- The writing app’s post links navigate the top-level page (`target="_top"`), so the post opens in the desktop shell with a real URL, not nested inside the Writing iframe.
- Browser back/forward works with normal page navigation.

### Visual language

The existing identity stays, with more desktop-specific chrome.

**Palette**

| Token | Value | Use |
|---|---|---|
| `--color-text` | `#1a1a1a` | Body text |
| `--color-muted` | `#555` | Secondary copy |
| `--color-accent` | `#a52a2a` | “Me!”, active dock strip, links on hover, rules |
| `--color-link` | `#0000ee` | Default links |
| `--color-window` | `#c0c0c0` | Window and dock surfaces |
| `--color-window-bar` | `#06068e` | Focused title bar (keep the current navy) |
| `--desktop-bg` | `#f1ede1` | Warm paper desktop |
| `--desktop-grid` | `rgb(26 26 26 / 0.05)` | 16px pixel grid |

**Desktop background**

- Warm off-white, with two 1px linear gradients forming a faint 16px grid.
- No photographic hero background and no large site-name watermark.
- A restrained pixel-flower motif may appear as a low-opacity fixed decoration in a corner, but it must not interfere with windows or text. If it competes, omit it.

**Type**

- Body and app copy: `var(--font-geist-pixel)` at a slightly smaller size than a normal reading site, because pixel type is wide.
- Display headings, window titles, the “Me!” line, and post titles: `var(--font-dotemp)`.
- Preserve the existing synthetic bold/italic treatment because both fonts have one cut.
- Prose keeps comfortable line-height (1.65–1.7) and a max width of 68ch inside the post window.

**Chrome**

- Square Win95 bevels, 2px outer borders, 1px inner highlights, no modern rounded cards.
- Active/focused title bars navy; inactive bars gray.
- Close button is a real pixel X icon, not a Unicode `✕`.
- Buttons and links share the existing 3px red focus outline.
- The red accent appears in “Me!”, the active dock strip, link hover, and section rules; it should not flood the desktop.

### Icons and logo

- All UI icons are 16×16 pixel grids rendered to 20×20 (dock) or 16×16 (title bars) with `shape-rendering: crispEdges` and `currentColor`.
- `src/data/icons.ts` stores the pixel grids; `PixelIcon.astro` converts runs of filled cells into `<rect>` elements at build time. No icon font, no SVG sprite request, no emoji characters in UI.
- Required icons: home, photos/camera, folder/cart, pencil, mail, RSS, close X, pin, and the flower mark.
- Every dock glyph is the same 20×20 rendered size. The dock buttons are the same 34×34 size.
- `public/favicon.svg` becomes a 16×16 pixel flower: five red petals around a yellow center on a transparent or cream field. The same flower is the About window icon and the visual mark in the About kicker.
- Icons are decorative when paired with a text label and `aria-hidden="true"`; icon-only dock links use `aria-label`.

### Emoji pipeline

The site uses a hybrid system so ordinary prose and curated accents both stay pixel-art:

1. **Curated pixel emoji SVGs (primary)** — PixelTwemojiMC-18 v8.0, 18×18, CC BY 4.0.
   - `scripts/extract-pixel-emojis.mjs` reproduces the extraction from the pinned upstream sprite sheet and `default.json`.
   - The script reads only the emoji listed in a small manifest, extracts the 18×18 cells, groups horizontal pixel runs by color, and writes `<rect>`-based SVG files into `src/assets/emoji/`.
   - Generated SVGs are committed; the sprite sheet is not. The build never downloads emoji assets.
   - `PixelEmoji.astro` renders a chosen SVG inline (or as an `<img>` with alt) at 18×18, aligned to the text baseline, with a readable label.
   - Use only the emojis actually present in content. The initial set should cover the existing `🤑` and a few accents used in About/Photos; add more only when content needs them.
2. **SerenityOS Emoji font (fallback)** — BSD-2-Clause, self-hosted.
   - Place `SerenityOS-Emoji.ttf` in `src/assets/fonts/`.
   - Declare `@font-face { font-family: 'SerenityOS Emoji'; src: url('../assets/fonts/SerenityOS-Emoji.ttf') format('truetype'); font-display: swap; unicode-range: … }` in the global stylesheet.
   - Append it to both body and display stacks after the primary font so any Unicode emoji not covered by a curated SVG still renders as pixel art instead of the platform’s glossy emoji.
   - Do not preload the 670KB font; it should load only when an emoji character needs it.
3. **No raw platform emoji in UI.** UI icons are always pixel SVGs. Emoji characters are content only.

Licensing:

- Add `THIRD_PARTY_NOTICES.md` with PixelTwemoji attribution (creator, source, CC BY 4.0, modifications: sprite sheet converted to individual SVGs) and the full SerenityOS BSD-2-Clause notice.
- Add `public/licenses/PixelTwemoji.txt` and `public/licenses/SerenityOS-Emoji.txt` so the notices ship with the static site.
- Add a small credits line or `<details>` block in the About app linking to those notices.

### Responsive behavior

- **≥ 901px:** fixed desktop stage, absolute windows, drag and stacking enabled, dock one row (unless the registry grows beyond the width, then it wraps).
- **≤ 900px:** normal document flow. The stage is a single column with `padding: 1rem 1rem calc(var(--dock-height) + 1.5rem)`. Windows are `position: static`, full width, height auto; iframes grow from app height messages with a fixed fallback. Drag is disabled. The stage scrolls; the dock remains fixed at the bottom.
- Windows stack in route order. On Home, About appears above Photos; the photo app is still always visible but no longer beside About.
- The dock app group may wrap to a second row. The clock stays in the dock. The dock’s measured height feeds the stage padding.
- At 320px: no page-level horizontal scrolling, no clipped headings, dock buttons are at least 32×32, tooltips do not cause overflow, and the About “Me!” offset remains visible without pushing the line off-screen.
- Use `dvh`/`svh` carefully; the desktop should not jump when mobile browser chrome hides. `min-height: 100dvh` and `overflow: hidden` on desktop are acceptable. On mobile, normal scroll takes over.
- Iframe app height messages should be debounced to one animation frame and ignored while the pointer is dragging.

### Accessibility

- Each window is a `<section>` with `aria-labelledby` pointing at its title bar title.
- Each iframe has a specific `title`; decorative icons are `aria-hidden`.
- Dock is a named navigation landmark; active app uses `aria-current`.
- Close buttons have accessible labels. Pinned windows show a pin and an “always open” status instead of a disabled close control, so there is no unreachable explanation.
- Windows can be used without dragging. Keyboard focus moves through window controls, iframe content, and the dock. `focusin` raises the window so focus is not hidden behind another window.
- After closing a window, focus moves to the corresponding dock link.
- Focus-visible outlines remain 3px red with offset.
- Text contrast meets WCAG AA on cream, gray, navy, and white surfaces.
- `prefers-reduced-motion` removes any window open/close transition.
- The hidden `h1` on shell app routes is visually hidden, not `display: none`.
- Images have meaningful alt text. Placeholder/empty states are text, not color alone.
- Tooltips are supplementary; the accessible name is on the link.
- No keyboard trap is introduced by iframes.

### Metadata, feeds, crawlers, and naming

Update `src/consts.ts`:

```ts
export const SITE_TITLE = 'Papi’s Artistic Garden';
export const SITE_DESCRIPTION =
  'Papi’s Artistic Garden — the personal site of Mazen Ragab (Maztardoo), a G12 STEM student into technology, AI, marketing, psychology, and building things.';
export const HOME_TITLE = 'Papi’s Artistic Garden — Mazen Ragab (Maztardoo)';
```

Other titles:

- Photos: `Photos · Papi’s Artistic Garden`
- Projects: `Projects · Papi’s Artistic Garden`
- Writing: `Writing · Papi’s Artistic Garden`
- Post: `{post title} · Papi’s Artistic Garden`
- Contact: `Contact · Papi’s Artistic Garden`
- RSS: `RSS · Papi’s Artistic Garden`
- 404: `Page not found · Papi’s Artistic Garden`

App documents use the same titles as their shell routes. Their canonical points to the shell route. Add `<link rel="alternate" type="application/rss+xml">` to shell and app documents. Keep the existing sitemap link.

RSS feed:

- Title `Papi’s Artistic Garden`.
- Description from `SITE_DESCRIPTION`.
- Site remains `https://maztard.github.io/MazenGarden/`.
- Item links remain `postUrl(post)`.
- No full-content feed.

Sitemap:

- Keep `@astrojs/sitemap`.
- Filter out URLs containing `/apps/`.
- Keep `/`, `/photos/`, `/projects/`, `/blog/`, `/contact/`, `/rss/`, and all published posts.
- 404 remains excluded.
- App docs stay crawlable (no `robots.txt` disallow) but canonicalize to shell routes. This keeps iframe content accessible without creating thin duplicate results.

`public/robots.txt` keeps the same sitemap URL. `README.md` is updated with the new name, architecture, routes, app-authoring steps, emoji/licensing notes, and the fact that blog posts remain server-rendered.

Update `package.json` `name` to `papis-artistic-garden` if it does not affect scripts or deployment; otherwise leave it. The visible name is what matters.

### File layout

```text
public/
  favicon.svg
  licenses/
    PixelTwemoji.txt
    SerenityOS-Emoji.txt
  robots.txt
scripts/
  extract-pixel-emojis.mjs
src/
  assets/
    emoji/
      <chosen>.svg
    fonts/
      Dotemp-8bit.ttf
      SerenityOS-Emoji.ttf
    images/
      ...
  components/
    apps/
      AboutApp.astro
      ContactApp.astro
      PhotosApp.astro
      ProjectsApp.astro
      RssApp.astro
      WritingApp.astro
    desktop/
      DesktopDock.astro
      DesktopWindow.astro
      DockButton.astro
    ui/
      PixelEmoji.astro
      PixelIcon.astro
      PostCard.astro
    PostWindow.astro
  data/
    apps.ts
    icons.ts
    photos.ts
  layouts/
    AppLayout.astro
    DesktopLayout.astro
  pages/
    404.astro
    index.astro
    photos/index.astro
    projects/index.astro
    contact/index.astro
    rss/index.astro
    rss.xml.ts
    blog/index.astro
    blog/[slug].astro
    apps/about/index.astro
    apps/photos/index.astro
    apps/projects/index.astro
    apps/writing/index.astro
    apps/contact/index.astro
    apps/rss/index.astro
  scripts/
    desktop.ts
  styles/
    global.css
  utils/
    date.ts
    posts.ts
    url.ts
  consts.ts
  content.config.ts
```

Remove or replace `SiteHeader.astro`, `SiteFooter.astro`, `PhotoCard.astro`, `ProjectsWindow.astro`, and `BlogPost.astro` once their content has moved. Keep `PostCard` for the Writing app, restyled. Keep `.prose` styles for posts.

### Data

`src/data/photos.ts`:

```ts
import type { ImageMetadata } from 'astro';

export interface Photo {
  image: ImageMetadata;
  alt: string;
  caption?: string;
}

export const photos: Photo[] = [/* four real photos of Mazen */];
```

- The photo app reads this array; the About/Photos home composition and `/photos/` share it.
- Exactly four photos ship in v1. The 2×2 grid, the “4 photos” status, and the tests all assume four. Adding more later means changing the grid/count deliberately rather than slicing a longer array silently.
- Alt text is mandatory. Captions remain in the type for future use but are not displayed in v1.
- Use Astro `<Image>` with an appropriate width and `loading="eager"` for the grid.

`src/data/apps.ts` drives the dock and routes as described above.

### Static clock and no-JS behavior

- The shell renders the dock and windows as static HTML.
- The clock is the only part of the shell that requires JavaScript; without it, the dock still navigates and the apps still read.
- `desktop.ts` is a plain TypeScript module bundled by Astro, with no framework.
- The script must be null-safe: tests and 404s may render fewer windows.

### Testing

Rewrite the Playwright suite against the built site at `http://localhost:4321/MazenGarden/`.

**Desktop shell**

- Home returns 200 and has the new title.
- `.desktop` exists; no `.site-header` or `.site-footer`.
- Dock has exactly six app links plus a clock; every app link has an accessible name and a base-prefixed href.
- Home has two windows: About and Photos. Photos has no close button; it shows the pin and “always open” status.
- The About iframe contains the two-line heading, “Mazen Ragab”, and five bio paragraphs.
- The Photos iframe contains four images with non-empty alt text.
- The dock clock matches `/^\d{2}:\d{2}$/` after load.
- Active dock state follows the route: Home on `/`, Writing on `/blog/` and post pages, etc.

**Windows**

- Clicking a background window raises it: compare computed `z-index` before/after.
- Dragging a title bar changes its bounding box; the window stays within the clamp.
- Clicking inside an iframe raises the window via the message path.
- Close hides a closable window and moves focus to its dock link.
- Pinned Home Photos, post, and 404 windows have no close button; they show the pin and “always open” status.
- Reload restores default positions.
- No uncaught page errors during drag/close.

**Routing and iframes**

- Every dock link navigates to the expected shell route.
- Each shell route loads its app iframe from a `/MazenGarden/apps/.../` URL.
- Each app document returns 200, has a visible `h1`, and canonicalizes to its shell route.
- Post links inside the Writing iframe navigate the top-level page to the real post URL.
- App documents’ direct “← Papi’s desktop” link is hidden when embedded and visible when opened directly.

**Blog**

- `/blog/` renders the Writing window and lists the published post.
- `/blog/hello-world/` returns 200, renders the article title/date/lede/body in the parent document (not just an iframe), and has the correct canonical URL.
- Back links return to `/blog/`.
- Draft posts remain absent from production output, RSS, and sitemap.

**Feeds and crawlers**

- `/rss.xml` returns XML with the new feed title and base-prefixed post links.
- `/sitemap-index.xml` points at `/sitemap-0.xml`.
- The sitemap includes shell routes and posts, excludes `/apps/*`, excludes drafts, and excludes 404.
- `/robots.txt` points at the sitemap.
- 404 returns the custom desktop 404 and is `noindex`.

**Responsive**

- At 1280×900, About and Photos are side by side; the dock is one row; no horizontal overflow.
- At 390×844 and 320×568, windows stack, the dock is visible, the clock is present, no page-level horizontal overflow, and the last window can scroll above the dock.
- At 768×1024, the stacked layout is active and the dock remains usable.
- At 320px, every dock target is at least 32×32 CSS pixels and no tooltip clips the viewport.
- App iframes grow on mobile and do not produce nested scrollbars in the tested apps.
- `prefers-reduced-motion` removes transitions.

**Assets and quality**

- No runtime requests to Google Fonts.
- Both text fonts load (`document.fonts.check`), and the emoji font loads when an emoji is present.
- Every same-origin document/stylesheet/script/font/image request succeeds and starts with `/MazenGarden/`.
- Every page has one `h1` in its own document, every iframe has a title, and every image has alt text.
- No console errors.

**Commands**

- `npm run check`
- `npm run build`
- `npm run test:e2e`
- `npm run format:check`

**Human QA**

- Capture 1280×900 and 390×844 screenshots into `tests/.artifacts/` and inspect the desktop composition, dock, and text wrapping.
- Drag windows, click-to-front, close About, reload, and navigate every dock route.
- Open a post from the Writing iframe and confirm the URL is the real post route.
- Check 320px for dock wrapping and the About “Me!” offset.

### Build sequence

1. Add the app registry, pixel icon data, photo data, and new shared constants.
2. Build `DesktopLayout`, `DesktopDock`, `DesktopWindow`, and `desktop.ts`.
3. Move About, Photos, Projects, Writing, Contact, and RSS content into app documents.
4. Build the shell routes, home composition, post window, and 404.
5. Add the emoji extraction script, PixelTwemoji assets, SerenityOS font, and licensing.
6. Update metadata, RSS, sitemap filter, favicon, README, and package name.
7. Rewrite Playwright tests and screenshots.
8. Run checks, build, test, inspect mobile/desktop screenshots, and commit locally.

### Risks and trade-offs

- **Iframe content is second-class for SEO.** Only blog posts are first-class, which is the content type that needs it. App pages canonicalize to shell routes, and shell routes carry metadata.
- **Iframe navigation traps.** Internal links must use `_top`, and the tests must click through the Writing iframe. This is the most likely integration bug.
- **Iframe drag swallowing.** Disabling iframe pointer events during drag and using the `papi:focus` message covers the common cases; test on a real pointer.
- **Mobile nested scroll.** Height messaging is included to avoid it, with a fixed fallback if messaging fails. This is more moving parts than a static stack, so test at 320/390.
- **Window positions versus viewport.** Default positions are clamped and drag is clamped; on very short viewports the app scrolls inside its window rather than disappearing below the dock.
- **Dock growth.** Wrapping to a second row changes the dock height; measuring it and padding the stage prevents the last window from being covered.
- **Fake OS fatigue.** Every control shown is real. No dead menus, no resize handles, no minimize buttons.
- **Base-path regressions.** App iframe URLs and canonical links are the new high-risk places. `withBase`, the production-base test server, and same-origin request assertions guard them.
- **Font loading inside iframes.** The app layouts must include the font setup, not rely on the parent document’s CSS. Shared stylesheet URLs keep the font cached.
- **Emoji licensing.** CC BY and BSD notices must ship visibly and in `public/licenses/`. Missing attribution is a real defect, not a polish item.
- **Content dependencies.** One real photo of Mazen is supplied; three more are needed before the four-photo Photos window fully meets the “photos of Mazen as a person” intent. The scenic images are temporary placeholders for the remaining slots only.
- **Clock time zone.** The clock uses the visitor’s local time. Tests assert format, not a fixed time.
- **Old tests.** The suite will fail until it is rewritten; that is expected, not a regression to patch around.

## Content status

The contact email is settled: `mazenra100@gmail.com`.

One of the four Photos app images is supplied at `src/assets/images/me/mazen-1.jpeg` (720×1280, a night portrait under a tree). A working alt is “Mazen standing on a grassy hill under a leafy tree at night, looking to his left.” That leaves **three more real photos of Mazen** needed, ideally a mix of portraits and life photos. Until they are supplied, the remaining three slots use the existing scenic images as explicit placeholders and are replaced before the redesign is called done.

## Decisions made in this document (check while reading)

- The dock routes are `/photos/`, `/projects/`, `/contact/`, and `/rss/`; `/blog/` and post URLs stay unchanged.
- Each app has a bare document under `/apps/<app>/`; only blog posts are rendered directly in the parent desktop document.
- Photos is pinned on Home and closable on `/photos/`; post and 404 windows are pinned too, so a canonical content URL never becomes an empty desktop.
- Pinned windows use a pin icon plus an “always open” chrome status strip instead of a disabled close button.
- The Photos app ships exactly four photos in a fixed 2×2 grid on both Home and `/photos/`.
- Home shows two windows; every other route shows one.
- Dock links are full-page navigation, not a client-side router.
- No resize, minimize, maximize, or position persistence in v1.
- Mobile uses a stacked layout at `≤900px` with drag disabled and iframe height messaging.
- The site name uses the curly apostrophe: `Papi’s Artistic Garden`.
- The Contact app uses `mazenra100@gmail.com`, GitHub, and Instagram; no contact form.
- The first Photos image is `src/assets/images/me/mazen-1.jpeg`; three more real photos are still needed, with scenic photos as temporary placeholders.
- The desktop uses a warm paper background, existing navy window bars, red accents, and square Win95 bevels.
- The flower replaces the “M” favicon and marks About; the dock Home glyph remains a house.
- Shell app routes use a visually hidden `h1`; post and 404 routes use their visible heading.
- App documents are canonicalized to shell routes and excluded from the sitemap.
- RSS gets a small HTML app at `/rss/` while the feed remains `/rss.xml`.

## Approval gate

Nothing in this document has been implemented. Product code waits for approval of this design. After approval, the next step is a written implementation plan, not direct coding.
