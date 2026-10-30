# Papi’s Artistic Garden: retro desktop redesign

**Date:** 2026-10-30  
**Status:** Approved — 2026-10-30  
**Scope:** Project  
**Repo:** `D:\papis-artistic-garden` & `D:\personalweb-copy`

## Intent

Redesign the personal site into a warm retro desktop inspired by Windows 95 aesthetic (matching the reference design).

The landing view features:
1. **Left Canvas (Static About Section):** The "About Me!" content is hardcoded directly onto the page background—never inside a window, never closes, and is always visible as the base anchor of the site.
2. **Right Floating Windows:** Real HTML `div`s (not iframes) with classic Win95 styling (navy title bar, close `[X]`, 3D bevels, drop shadow) floating on the desktop. On landing, a `MEET-MAZEN` photo window and an overlapping `SOCIALS` window are open.
3. **Bottom Win95 Taskbar Dock:** A bottom-center floating dock with pixel app icons and a real-time digital clock that toggles and brings forward windows (`MEET-MAZEN`, `SOCIALS`, `PROJECTS`, `WRITING`, `RSS`).
4. **Blended SEO & In-Page Blog Architecture:**
   - On the desktop, opening the Writing window and clicking an article displays the post directly inside that window with "← Back to articles" and updates the URL bar via `history.pushState`.
   - Astro also pre-renders `/blog/[slug]/` at build time so search engine crawlers, RSS feeds, and direct URL visitors receive the full server-rendered article HTML in the desktop shell.
   - **Zero iframes** across the entire project.

## Goals

- Static About section anchored on the page canvas on the left: giant pixel "About", offset red "Me!", name, and 5 bio paragraphs.
- Pure HTML `div` window system: draggable by titlebar, stackable with click-to-front, and closable with `[X]`.
- Landing composition matching reference screenshot: left About canvas, right `MEET-MAZEN` photo window, overlapping `SOCIALS` window.
- Bottom Win95 taskbar dock with pixel icons for Photos, Socials, Projects, Writing, RSS, and a live clock.
- In-window blog reading for visitors + static `/blog/[slug]/` routes for Google/crawlers and RSS subscribers.
- Zero iframes, zero cross-origin messaging, zero nested iframe scrolling issues.
- Responsive mobile fallback: below 900px, content flows in a clean document stack above the dock.
- Full type-safety, build verification, and Playwright E2E test coverage.

## Non-goals

- No iframes or `/apps/*` sub-documents.
- No window resizing or minimize/maximize controls.
- No third-party analytics or server runtimes (pure static Astro output on GitHub Pages).

## Architecture & Layout

### 1. Page Background Canvas (Left)
- Markup: `<section class="desktop__about">` directly inside the desktop main container.
- Content:
  - Header: `About` + `<span class="about__accent">Me!</span>` with clamp offset.
  - Name: `Mazen Ragab aka (Maztardoo)`.
  - Bio: The 5 personal bio paragraphs.
  - Social badges / quick links.

### 2. Window System (`DesktopWindow.astro`)
- Structure:
  ```html
  <div class="desktop-window" data-window="photos" id="window-photos">
    <div class="desktop-window__bar" data-window-handle>
      <PixelIcon name="photos" size={16} />
      <span class="desktop-window__title">MEET-MAZEN</span>
      <button type="button" class="desktop-window__close" data-window-close aria-label="Close">
        <PixelIcon name="close" size={12} />
      </button>
    </div>
    <div class="desktop-window__body">
      <slot />
    </div>
  </div>
  ```
- Windows:
  - `MEET-MAZEN` (Photos): 2×2 photo grid or portrait featuring Mazen. Open on load.
  - `SOCIALS` (Contact): Instagram, GitHub, email links. Open on load overlapping photos.
  - `PROJECTS`: EmadEats Project, BuggyEyes, Sudany.
  - `WRITING`: Article list; in-window article reader with "← Back to articles".
  - `RSS`: Feed URL with one-click copy button.

### 3. Bottom Taskbar Dock (`DesktopDock.astro`)
- Positioned fixed bottom-center.
- Contains buttons for Photos, Socials, Projects, Writing, RSS, plus live 24h digital clock.
- Clicking a dock button toggles the window visibility or raises it to front if already open.

### 4. Blog & SEO Blend
- `src/pages/index.astro`: Default homepage desktop.
- `src/pages/blog/[slug].astro`: Renders the desktop with the Writing window pre-opened displaying the specific post.
- RSS feed at `/rss.xml` links to `/blog/[slug]/`.
- Sitemap includes `/` and all `/blog/[slug]/` routes.

### 5. Client Script (`desktop.ts`)
- Stacking: Click/focus raises window z-index.
- Dragging: Pointer capture on `[data-window-handle]` with boundary clamps.
- Toggling: Dock button clicks toggle `hidden` attribute and raise window.
- Blog post viewer: Intercepts post link clicks inside the Writing window to swap article content in-place and update `history.pushState`.
- Clock: Ticks every 15s in 24h format with localized full-date label.
