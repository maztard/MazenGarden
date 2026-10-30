# Design Spec: Hybrid Windows XP + Windows 95 Retro Desktop & Interactive Square Skills

**Date:** 2026-10-31  
**Status:** Proposed — awaiting user approval  
**Scope:** Design & UI Feature Enhancement  
**Reference Design:** Windows XP (Luna Blue & Bliss Palette) + Windows 95 (3D Bevels, Draggable Windows, Pixel Art)

---

## 1. Intent & Problem Statement

The user requested two major design evolutions:
1. **Remove Duplicate Taskbar & Make Banner Fullscreen (100vh):**
   - The desktop banner currently contains a middle system strip (`Start`, path, status cells) that creates a redundant "two taskbars" look alongside the bottom dock.
   - The top hero desktop banner should span the screen's full viewport width and height (`100vw` / `100vh`), presenting an authentic full-screen desktop that encourages users to explore by scrolling down or clicking the desktop icons.
2. **Pivot to Hybrid Windows XP + Windows 95 Palette:**
   - Elevate the retro aesthetic with the vibrant, cheerful color saturation of Windows XP (Luna royal blue `#0055ea`, emerald green `Start` button, rich Bliss sky/grass greens, golden accents) while maintaining authentic Win95 3D physical bevels and pixel icons.
3. **Interactive Square Skills Tiles:**
   - The circular skill badges in the About section feel static and lack life.
   - Replace circles with interactive **3D square tiles/buttons** themed around Win95/XP control applets with vibrant accent colors, hover glows, and tactile press-down states.

---

## 2. Goals & Non-Goals

### Goals
- **Single Taskbar:** Only the fixed bottom Win95/XP taskbar dock remains; the redundant middle strip in `DesktopBanner.astro` is removed.
- **Fullscreen Hero Landing:** `DesktopBanner` fills `100vw` and `100vh` (or `100dvh`), featuring desktop icons, centered title, and a retro explore indicator.
- **Interactive Desktop Icons:**
  - `My Computer`: Smooth-scrolls to the About Me canvas and focuses the `MEET-MAZEN` photo window.
  - `Folder`: Opens and focuses the `PROJECTS` window.
  - `Recycle Bin`: Opens the `RSS` feed window.
- **Vibrant Hybrid XP + 95 Theme:**
  - Classic XP Luna blue gradients on focused title bars (`linear-gradient(90deg, #0055ea 0%, #2080ea 50%, #0055ea 100%)`).
  - XP Emerald green `Start` button (`linear-gradient(180deg, #388e3c 0%, #2e7d32 100%)` with white text and curved retro feel).
  - High-saturation Bliss wallpaper SVG gradients.
- **Interactive Square Skills Tiles:**
  - Square 3D beveled cards with distinct color-coded headers/accents:
    - **Tech**: Luna Cobalt (`#1976d2`)
    - **AI**: Electric Violet (`#7b1fa2`)
    - **Marketing**: XP Tangerine (`#f57c00`)
    - **Psychology**: Crimson Coral (`#d32f2f`)
    - **Web**: Emerald Teal (`#00796b`)
  - Tactile 3D press-down on `:active`, hover lift, and skill highlights.
- **100% Green Test Suite:** Update Playwright tests to verify full-screen hero, icon clicks, single dock, and square skills.

### Non-Goals
- No heavy third-party CSS or animation libraries (keep pure CSS and vanilla TypeScript).
- No removal of core retro elements (dither pattern, pixel fonts, and window drag/stack mechanics remain intact).

---

## 3. Approaches Considered

- **Approach A: "Luna 95" — Saturated Retro Bevels with XP Palette (Selected)**
  - Combines XP's rich color palette (Luna blue, emerald start, color-coded skill tiles) with Win95 3D tactile bevels and drag physics.
  - Clean separation: Hero fills 100vh, canvas + windows underneath.
- **Approach B: "XP Media Center / Tile Widgets" (Rejected)**
  - Heavy glossy reflections and complex tag-cloud cards within skills. Rejected to keep the clean, snappy retro feel.

---

## 4. Component Changes

### 4.1 `DesktopBanner.astro`
- Remove `.desktop-banner__system-strip` completely.
- Change `.desktop-banner` to `min-height: 100vh; min-height: 100dvh; width: 100%;`.
- Position desktop icons at top-left with `button` type and click handler data attributes (`data-hero-action="computer"`, `data-hero-action="folder"`, `data-hero-action="trash"`).
- Center headline `PORTFOLIO` / `PAPI’S ARTISTIC GARDEN` with high-contrast text shadow.
- Add bottom explore indicator button (`.desktop-banner__scroll-hint`) that smooth-scrolls down to `#about-me`.

### 4.2 `AboutCanvas.astro`
- Replace `.about-canvas__skills-list` circular pills (`border-radius: 50%`) with `.skills-grid` composed of square retro 3D tiles (`.skill-tile`).
- Each tile features:
  - 3D raised border (`border: 2px solid`, raised box shadow, active depressed state).
  - Category icon / badge header with XP color accent.
  - Bold pixel skill title.
  - Subtitle / specialty micro-copy (e.g. "Systems & Code", "LLMs & Automation", "Growth & Brand", "Human Behavior", "Fullstack Apps").

### 4.3 `DesktopDock.astro` & `DockButton.astro`
- Style the `Start` button with Windows XP vibrant emerald green gradient (`#388e3c` to `#2e7d32`) with bold white text.
- Dock buttons retain Win95 tactile bevels with Luna blue active glow.

### 4.4 `desktop.ts`
- Add click listeners for `[data-hero-action]`:
  - `computer`: Scrolls to `#main` or `#about-me` and brings `MEET-MAZEN` to front.
  - `folder`: Opens `projects` window and brings it to front.
  - `trash`: Opens `rss` window and brings it to front.
  - Scroll hint: Smooth-scrolls to the desktop stage.

### 4.5 `global.css`
- Update design tokens for XP Luna palette:
  - `--color-xp-blue: #0055ea;`
  - `--color-xp-blue-dark: #003db8;`
  - `--color-xp-green: #388e3c;`
  - `--color-xp-orange: #f57c00;`
- Style `.skill-tile` as square cards with hover elevation and `:active` inset depression.

---

## 5. Testing & Verification

1. `tests/banner.spec.ts`: Verify banner spans `100vh` and has no duplicate system strip.
2. `tests/desktop-script.spec.ts`: Verify desktop icons trigger actions (Folder opens Projects, Computer scrolls and focuses About).
3. `tests/apps.spec.ts` & `tests/home.spec.ts`: Verify skills are rendered as square interactive tiles with XP colors.
4. `npm run check` and `npm run test`: 100% passing across all viewports without horizontal overflow.
