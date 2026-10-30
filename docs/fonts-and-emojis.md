# Typography & Fonts System

This document outlines the retro typography and font pipeline implemented in **Papi’s Artistic Garden**.

---

## 1. Fonts Overview

The site uses a strict retro typography stack with zero runtime external requests (no live Google Fonts network calls).

| Font | Type | Source Path | CSS Variable | Purpose & Usage |
|---|---|---|---|---|
| **Dotemp (8-bit)** | Local TrueType (`.ttf`) | `src/assets/fonts/Dotemp-8bit.ttf` | `--font-dotemp` | Display headings, window titlebars, retro labels, the offset red **"Me!"** line, and dock tooltips. |
| **Geist Pixel** | Web font (downloaded at build) | Astro Fonts API (`fontProviders.google()`) | `--font-geist-pixel` | Primary body copy, bio paragraphs, article prose, and descriptions. |

---

## 2. Font Stacks in `src/styles/global.css`

```css
:root {
  --font-body: var(--font-geist-pixel), system-ui, sans-serif;
  --font-display: var(--font-dotemp), 'Courier New', monospace;
}
```

---

## 3. Self-Hosting & Zero-Runtime Google Requests

In `astro.config.mjs`:

```js
fonts: [
  {
    provider: fontProviders.local(),
    name: 'Dotemp',
    cssVariable: '--font-dotemp',
    options: {
      variants: [
        {
          src: ['./src/assets/fonts/Dotemp-8bit.ttf'],
          weight: 400,
          style: 'normal',
        },
      ],
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
]
```

At build time, Astro downloads the Google font assets and bundles them into `dist/_astro/`. Browsers loading the site make 0 requests to `fonts.googleapis.com` or `fonts.gstatic.com`.

---

## 4. 16×16 Pixel Icon Grid System

Instead of heavy icon font files or emoji dependencies, all desktop icons and window chrome graphics are rendered using pure SVG pixel coordinate grids from `src/data/icons.ts` via `PixelIcon.astro`. Each icon is defined as an array of `[x, y]` coordinates on a 16×16 grid, ensuring crisp rendering (`shape-rendering="crispEdges"`) at any size with zero font loading overhead.
