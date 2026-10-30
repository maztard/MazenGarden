# Papi’s Artistic Garden: Retro Desktop & Portfolio Design Spec

**Date:** 2026-10-30  
**Status:** Proposed — awaiting user approval  
**Scope:** Project  
**Inspiration:** Sophie Van Schil Graphic Portfolio 2024 (Behance) + Interactive Windows 95 Desktop  
**Repositories:** `D:\papis-artistic-garden` & `D:\personalweb-copy`

---

## 1. Vision & Intent

A blended retro web experience combining the visual graphic design of a 90s OS portfolio (inspired by Sophie Van Schil's Behance design) with a fully interactive Windows 95 desktop:

1. **Top Landscape Hero Banner:**
   - Dithered pastoral landscape wallpaper (blue sky, grassy hills).
   - Retro desktop icons on top-left (Folder, Computer, Recycle Bin).
   - Centered headline: **PORTFOLIO** / **PAPI’S ARTISTIC GARDEN** by Mazen Ragab.
   - Retro Win95 system strip beneath the landscape (`Start`, address/path strip, clock).

2. **The About Me Canvas (Permanent Base Layer):**
   - Positioned on the left side of the page, directly on the canvas (never in a window, never closes).
   - Typography: Giant pixel `about` on line 1, offset red `me!` on line 2 (Dotemp font).
   - Name: `Mazen Ragab aka (Maztardoo)` in italic/bold accent.
   - Bio: The 5 personal bio paragraphs.
   - **SKILLS** section: Circular retro badges for Tech, AI, Marketing, Psychology, Web.
   - **EDUCATION** section: New Cairo STEM School (G12).

3. **Interactive Floating Win95 Windows (Right & Foreground):**
   - Real HTML `div`s with authentic Windows 95 chrome: navy title bar, white text, 3D outer bevels, inset border, and close `[X]` buttons.
   - **Zero iframes:** Content is rendered directly as component slots.
   - **Default Open on Landing:**
     - `MEET-MAZEN`: Window on the right showing Mazen's portrait photo in retro frame.
     - `SOCIALS`: Floating window overlapping the photo's bottom-right corner with links to Instagram (`@papisartisticgarden`), GitHub (`maztard`), and email (`mazenra100@gmail.com`).
   - **On-Demand Windows (Opened via Dock or Link):**
     - `PROJECTS`: Win95 browser frame showcasing EmadEats Project, BuggyEyes, and Sudany.
     - `WRITING`: Article list with instant in-window article reading and `history.pushState` URL syncing.
     - `RSS`: Feed URL box with one-click copy button.

4. **Floating Bottom Win95 Taskbar Dock:**
   - Fixed at bottom-center with Win95 bevels and drop shadow.
   - Left `Start` button, app toggle buttons (`Photos`, `Socials`, `Projects`, `Writing`, `RSS`) with pixel icons, and live digital clock.
   - Clicking an app button toggles the window open/closed or brings it to the front.

5. **Blended SEO & Direct Deep Links:**
   - Static Astro output pre-renders `/blog/[slug]/` routes.
   - Search engine crawlers and RSS subscribers accessing `/blog/[slug]/` receive the full desktop with the article pre-opened as server-rendered HTML.
   - Internal site navigation remains instant in-page DOM swapping with no page reloads.

---

## 2. Goals & Non-Goals

### Goals
- Authentic retro aesthetic matching the Behance reference: landscape banner, desktop icons, skills/education lists, and overlapping window composition.
- Static About section anchored to page canvas on the left.
- Interactive HTML `div` windows: draggable title bars, click-to-front z-index stacking, and close `[X]` buttons.
- Bottom Win95 taskbar dock with clock and app toggles.
- Zero iframes.
- Mobile responsive: below 900px, elements stack vertically in clean document flow above the fixed dock.
- Full SEO discoverability and RSS feed integrity.
- 100% passing Playwright test suite and typechecks.

### Non-Goals
- No client-side SPA routing library (pure vanilla TypeScript helper).
- No audio sound effects or theme toggles.
- No window resizing or minimize/maximize animations.

---

## 3. Component Architecture

```
src/
├── components/
│   ├── apps/
│   │   ├── AboutCanvas.astro        # Static About, skills badges, education on canvas
│   │   ├── MeetMazenWindow.astro    # Photo window content (Mazen's portrait)
│   │   ├── SocialsWindow.astro      # Social links window content (IG, GitHub, email)
│   │   ├── ProjectsContent.astro    # Projects showcase window content
│   │   ├── WritingContent.astro     # Blog list + in-window post viewer
│   │   └── RssContent.astro         # RSS subscription and copy button
│   ├── desktop/
│   │   ├── DesktopBanner.astro      # Top retro landscape banner with title and desktop icons
│   │   ├── DesktopDock.astro        # Fixed bottom Win95 taskbar with Start and clock
│   │   ├── DockButton.astro         # Single dock icon button
│   │   └── DesktopWindow.astro      # Win95 window div wrapper with handle, title, close [X]
│   └── ui/
│       ├── PixelIcon.astro          # 16x16 pixel coordinate SVG renderer
│       └── PixelEmoji.astro         # 18x18 pixel emoji renderer
├── data/
│   ├── apps.ts                      # Dock and window definitions
│   ├── icons.ts                     # Pixel icon coordinate grids
│   └── photos.ts                    # Photos data (Mazen's portrait + placeholders)
├── layouts/
│   └── DesktopLayout.astro          # Root layout (head, fonts, favicon, dock, script)
├── pages/
│   ├── index.astro                  # Main single-page retro desktop
│   ├── blog/
│   │   └── [slug].astro             # Canonical SEO routes pre-opening Writing window
│   ├── 404.astro                    # Custom retro 404 desktop
│   └── rss.xml.ts                   # RSS 2.0 endpoint
├── scripts/
│   └── desktop.ts                   # Client script: drag, stacking, dock toggles, clock, post reader
└── styles/
    └── global.css                   # Complete styling: Win95 chrome, bevels, canvas, layout, responsive
```

---

## 4. Window Behaviors & State Management

- **Initial State:**
  - `MEET-MAZEN` (Photos): Open (`hidden: false`), positioned upper right.
  - `SOCIALS`: Open (`hidden: false`), positioned overlapping bottom-right of `MEET-MAZEN`.
  - `PROJECTS`: Closed (`hidden: true`).
  - `WRITING`: Closed on `/` (`hidden: true`); Open on `/blog/[slug]/`.
  - `RSS`: Closed (`hidden: true`).
- **Dock Click:**
  - If window is closed $\rightarrow$ Open it and bring to front (`z-index`).
  - If window is open and topmost $\rightarrow$ Close it (toggle).
  - If window is open but behind $\rightarrow$ Bring to front.
- **Dragging:**
  - Pointerdown on `[data-window-handle]` captures pointer.
  - Clamped so at least 80px remains on screen.
  - Disabled on mobile ($\le$ 900px) and coarse pointers.
- **Blog Reading:**
  - In `WritingContent.astro`: Clicking an article title toggles post view inline and sets `history.pushState(null, '', postUrl)`.
  - Clicking "← Back to articles" reverts to the list and sets `history.pushState(null, '', withBase('/'))`.

---

## 5. Responsive Behavior ($\le$ 900px)

- Desktop banner scales gracefully.
- Left About canvas and right windows stack in clean vertical document flow.
- Window absolute positioning and drag are disabled; windows become full-width static cards.
- Bottom dock remains fixed and accessible.
- Zero horizontal overflow down to 320px.
