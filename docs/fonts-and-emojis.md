# Typography, Fonts & Emoji System

This document outlines the retro typography, pixel emoji pipeline, and custom icon system implemented in **Papi’s Artistic Garden**.

---

## 1. Fonts Overview

The site uses a strict self-hosted retro typography stack with zero runtime external requests (no live Google Fonts network calls).

| Font                 | Type                           | Source Path                                | CSS Variable                                            | Purpose & Usage                                                                                     |
| -------------------- | ------------------------------ | ------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Dotemp (8-bit)**   | Local TrueType (`.ttf`)        | `src/assets/fonts/Dotemp-8bit.ttf`         | `--font-dotemp`                                         | Display headings, window titlebars, retro labels, the offset red **"Me!"** line, and dock tooltips. |
| **Geist Pixel**      | Web font (downloaded at build) | Astro Fonts API (`fontProviders.google()`) | `--font-geist-pixel`                                    | Primary body copy, bio paragraphs, article prose, and descriptions.                                 |
| **SerenityOS Emoji** | Local TrueType (`.ttf`)        | `src/assets/fonts/SerenityOS-Emoji.ttf`    | In fallback stack of `--font-body` and `--font-display` | Automatic pixel emoji fallback for standard Unicode emojis in copy.                                 |

### Font Stacks in `src/styles/global.css`

```css
:root {
  --font-body: var(--font-geist-pixel), 'SerenityOS Emoji', system-ui, sans-serif;
  --font-display: var(--font-dotemp), 'SerenityOS Emoji', 'Courier New', monospace;
}
```

### Self-Hosting & Zero-Runtime Google Requests

In `astro.config.mjs`:

```js
fonts: [
  {
    provider: fontProviders.local(),
    name: 'Dotemp',
    cssVariable: '--font-dotemp',
    options: {
      variants: [{ src: ['./src/assets/fonts/Dotemp-8bit.ttf'], weight: 400, style: 'normal' }],
    },
  },
  {
    provider: fontProviders.google(),
    name: 'Geist Pixel',
    cssVariable: '--font-geist-pixel',
    weights: [400],
    styles: ['normal'],
    subsets: ['latin'],
    fallbacks: ['sans-serif'],
  },
];
```

Astro's Fonts API downloads Geist Pixel during the build step and packages the font files directly into the static output bundle. At runtime, no requests are made to Google's servers.

---

## 2. Emoji Pipeline

Modern platform emojis (Apple, Google, Windows) are glossy and high-resolution, which breaks the retro 90s aesthetic. To maintain authentic pixel art across all devices, the site uses a hybrid emoji pipeline:

### A. Primary: Curated PixelTwemoji SVGs (18×18)

- **Source:** [AmberWat/PixelTwemojiMC-18](https://github.com/AmberWat/PixelTwemojiMC-18) v8.0.
- **License:** CC BY 4.0.
- **Location:** `src/assets/emoji/` (e.g., `1f911.svg` for `🤑`).
- **Rendering Component:** `src/components/ui/PixelEmoji.astro`.
- **How It Works:**
  - Converts Unicode emoji characters to hex codepoints (e.g., `🤑` $\rightarrow$ `1f911`).
  - Renders inline `<rect>`-based SVGs at 18×18 pixels.
  - Applies CSS rules:
    ```css
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    ```
- **Example Usage in Astro:**
  ```astro
  ---
  import PixelEmoji from '../components/ui/PixelEmoji.astro';
  ---

  <p>
    Nothing crazy, just taking a pic <PixelEmoji emoji="🤑" alt="money-mouth face" />
  </p>
  ```

### B. Fallback: SerenityOS Emoji Font

- **Source:** [SerenityOS](https://github.com/SerenityOS/serenity) / [linusg/serenityos-emoji-font](https://github.com/linusg/serenityos-emoji-font).
- **License:** BSD-2-Clause.
- **Font File:** `src/assets/fonts/SerenityOS-Emoji.ttf` (670 KB).
- **CSS Declaration in `src/styles/global.css`:**
  ```css
  @font-face {
    font-family: 'SerenityOS Emoji';
    src: url('../assets/fonts/SerenityOS-Emoji.ttf') format('truetype');
    font-display: swap;
    unicode-range: U+231A-1FAF6; /* Unicode Emoji range */
  }
  ```
- **How It Works:** Any raw emoji character typed in Markdown or HTML that lacks a pre-extracted SVG is automatically intercepted by the browser's font matcher and rendered as an authentic 10×10 retro pixel glyph.

---

## 3. UI Iconography System (No Raw Emojis in UI)

Standard emoji characters are strictly forbidden in UI chrome (window titlebars, dock buttons, navigation). Instead, UI glyphs are generated as vector pixel art:

- **Coordinate Data:** Stored in `src/data/icons.ts` as arrays of `[x, y]` coordinates on a 16×16 grid.
- **Rendering Component:** `src/components/ui/PixelIcon.astro`.
- **Run-Length Encoding:** Groups consecutive horizontal pixel cells on each row into single SVG `<rect>` elements at build time to keep the DOM lightweight and fast.
- **Styling:** Styled with `fill="currentColor"` and `shape-rendering="crispEdges"`, allowing icons to adopt the text color of their parent element (e.g., dock buttons, window bars).

### Available Icons

| Icon Name  | Symbol                      | Where Used                                    |
| ---------- | --------------------------- | --------------------------------------------- |
| `home`     | Peaked house silhouette     | Home dock button                              |
| `photos`   | Camera with lens circle     | Photos window titlebar & dock button          |
| `projects` | Shopping cart / code folder | Projects window titlebar & dock button        |
| `writing`  | Diagonal pencil             | Writing window titlebar & dock button         |
| `contact`  | Mail envelope               | Socials/Contact window titlebar & dock button |
| `rss`      | Broadcast signal waves      | RSS window titlebar & dock button             |
| `close`    | 2px retro X cross           | Window titlebar close `[X]` button            |
| `pin`      | Pushpin                     | Pinned window indicator                       |
| `flower`   | 5-petal pixel flower        | Site visual mark & `public/favicon.svg`       |
| `computer` | Classic desktop PC          | Desktop landscape banner icon                 |
| `folder`   | Classic Windows folder      | Desktop landscape banner icon                 |
| `trash`    | Recycle bin                 | Desktop landscape banner icon                 |

### Example Usage

```astro
---
import PixelIcon from '../ui/PixelIcon.astro';
---

<!-- Render a 16x16 icon -->
<PixelIcon name="writing" size={16} />

<!-- Render a 20x20 dock icon -->
<PixelIcon name="photos" size={20} />
```

---

## 4. Licenses & Legal Attribution

All third-party fonts and assets include full attribution notices:

- **PixelTwemoji:** Licensed under [CC BY 4.0](public/licenses/PixelTwemoji.txt). Extracted from `AmberWat/PixelTwemojiMC-18`.
- **SerenityOS Emoji:** Licensed under the [BSD 2-Clause License](public/licenses/SerenityOS-Emoji.txt). Copyright (c) the SerenityOS developers.
- Attribution documentation is preserved in `THIRD_PARTY_NOTICES.md` and deployed to `public/licenses/`.
