# MazenGarden Astro + Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the single-page site in Astro, add a Markdown blog with RSS and sitemap, fix the mobile layout, and deploy the static output to the existing `/MazenGarden/` GitHub Pages site.

**Architecture:** Astro 7 static output with one typed Markdown content collection. Pages and reusable `.astro` components share one token-driven global stylesheet. Astro’s Fonts API self-hosts both typefaces at build time; Astro’s image pipeline optimizes the four photos. Only the projects-window close button ships JavaScript. Playwright verifies the built site at the production base path.

**Tech Stack:** Astro 7.4.3, TypeScript 6.0.3 (strict), npm, `@astrojs/rss` 4.0.19, `@astrojs/sitemap` 3.7.4, `sharp` 0.35.5, Playwright 1.64.1, Prettier 3.9.10 with `prettier-plugin-astro` 1.1.2.

**Spec:** `docs/superpowers/specs/2026-10-28-mazengarden-astro-blog-design.md`

## Global Constraints

- Target repo and base: `https://maztard.github.io` + `/MazenGarden/`; `trailingSlash: 'always'`.
- Node `>=22.23.4`, npm, committed `package-lock.json`.
- Preserve all existing bio, card, and project copy verbatim. The bio becomes five `<p>` elements; the only content fixes are splitting the bio, removing the stray `]`, and adding blog/nav copy.
- Preserve the retro identity: Dotemp display type, Geist Pixel body, brown accent `#a52a2a`, blue links `#0000ee`, gray window `#c0c0c0`, blue window bar `#06068e`, white background.
- No inline `style` attributes in authored markup.
- Every internal URL goes through `withBase()`; no hardcoded `/MazenGarden/` in components or pages.
- One content collection: flat Markdown files in `src/content/blog/`, schema fields `title`, `description`, `date`, `draft`.
- No CMS, comments, newsletter, search, tags, pagination, analytics, dark mode, custom domain, post images, or MDX.
- No push to `origin`. No GitHub settings changes by the agent.
- Run `npm run format` before each commit and include the formatted result in that commit.
- Local commits only, one per task.

## Review Focus

These are the failure modes most likely to hurt a real visitor. Each has a named automated check in the task that owns the code.

1. **Base-path drift:** a link, font, image, feed item, or sitemap URL missing or doubling `/MazenGarden/`. Covered by `tests/shell.spec.ts`, `tests/feeds.spec.ts`, and `tests/layout.spec.ts`.
2. **320px overflow:** the hero offset, long headings, bio, cards, header, or projects window pushes the page sideways. Covered by `tests/layout.spec.ts` and the task-specific 320px checks.
3. **Google Fonts at runtime:** a stray `<link>`, `@import`, or provider fallback sends visitor data to Google. Covered by `tests/shell.spec.ts` and a built-HTML assertion.
4. **Feed/sitemap/blog mismatch:** a post appears on the site but not in RSS/sitemap, or links lack the base path, or a draft leaks into production. Covered by `tests/feeds.spec.ts` and `tests/blog.spec.ts`.
5. **Dead close button:** the window cannot be dismissed, or a second activation throws. Covered by `tests/projects.spec.ts`.

---

## File Map

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Site/base/trailing-slash, sitemap integration, local + Google font definitions |
| `package.json` | Dependencies and dev/build/check/test/format scripts |
| `tsconfig.json` | Astro strict TypeScript config |
| `playwright.config.ts` | Preview server, `/MazenGarden/` base URL, test discovery |
| `src/consts.ts` | Site title, description, homepage title |
| `src/utils/url.ts` | `withBase()` |
| `src/utils/date.ts` | UTC date formatting |
| `src/utils/posts.ts` | Published-post query, sorting, post URLs |
| `src/content.config.ts` | `blog` collection schema |
| `src/content/blog/hello-world.md` | Starter post |
| `src/layouts/BaseLayout.astro` | Document shell, metadata, fonts, header/footer |
| `src/layouts/BlogPost.astro` | Post article wrapper and prose slot |
| `src/components/SiteHeader.astro` | Brand + Home/Writing/RSS nav |
| `src/components/SiteFooter.astro` | Copyright + RSS |
| `src/components/PhotoCard.astro` | Optimized photo + text card |
| `src/components/PostCard.astro` | Date + linked title + description |
| `src/components/ProjectsWindow.astro` | Retro window, project list, close script |
| `src/pages/index.astro` | Homepage content |
| `src/pages/blog/index.astro` | Post list |
| `src/pages/blog/[slug].astro` | Post route |
| `src/pages/rss.xml.ts` | RSS feed endpoint |
| `src/pages/404.astro` | Not-found page |
| `src/styles/global.css` | Tokens, reset, layout, components, prose, responsive rules |
| `public/robots.txt` | Crawler policy + sitemap URL |
| `public/favicon.svg` | Pixel “M” favicon |
| `.github/workflows/deploy.yml` | GitHub Pages build/deploy |
| `tests/*.spec.ts` | Playwright coverage |
| `README.md` | Stack, authoring, commands, deployment |

---

### Task 1: Scaffold Astro, move assets, and establish the base-path test harness

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.prettierrc.mjs`, `.prettierignore`, `playwright.config.ts`, `src/consts.ts`, `src/utils/url.ts`, `src/pages/index.astro`, `tests/smoke.spec.ts`
- Move: `fonts/Dotemp-8bit.ttf` → `src/assets/fonts/Dotemp-8bit.ttf`; `imgs/{sky1,sky2,dorm1,random1}.jpeg` → `src/assets/images/`
- Delete: `index.html`, `styles.css`, `fonts/`, `imgs/` (after moving), `ascii-text-art.png`
- Delete stale docs: `docs/superpowers/specs/2026-10-28-personalweb-clean-refactor-design.md`, `docs/superpowers/plans/2026-10-28-personalweb-clean-refactor.md`

**Interfaces:**
- Produces: `withBase(path?: string): string` from `src/utils/url.ts`.
- Produces: `SITE_TITLE`, `SITE_DESCRIPTION`, `HOME_TITLE` string constants from `src/consts.ts`.
- Produces: `baseURL` in Playwright set to `http://localhost:4321/MazenGarden/`; `npm run test:e2e` builds then tests.
- Produces: build that succeeds with both fonts configured and self-hosted.

- [ ] **Step 1: Create the feature branch and commit the approved design + plan**

```powershell
git switch -c astro-blog
Remove-Item docs\superpowers\specs\2026-10-28-personalweb-clean-refactor-design.md
Remove-Item docs\superpowers\plans\2026-10-28-personalweb-clean-refactor.md
git add -A docs
git commit -m "docs: approve Astro blog design and plan"
```

- [ ] **Step 2: Move the fonts and photos, then remove the old page and unused assets**

```powershell
New-Item -ItemType Directory -Force src\assets\fonts, src\assets\images, public | Out-Null
Move-Item fonts\Dotemp-8bit.ttf src\assets\fonts\Dotemp-8bit.ttf
Move-Item imgs\sky1.jpeg src\assets\images\sky1.jpeg
Move-Item imgs\sky2.jpeg src\assets\images\sky2.jpeg
Move-Item imgs\dorm1.jpeg src\assets\images\dorm1.jpeg
Move-Item imgs\random1.jpeg src\assets\images\random1.jpeg
Remove-Item ascii-text-art.png -Force
Remove-Item index.html, styles.css -Force
Remove-Item fonts, imgs -Recurse -Force
```

Expected: `src/assets/images/` has exactly the four JPEGs; `src/assets/fonts/` has `Dotemp-8bit.ttf`; the old HTML/CSS/font/photo directories are gone.

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "mazengarden",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "engines": { "node": ">=22.23.4" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test:e2e": "npm run build && playwright test",
    "test": "npm run check && npm run test:e2e"
  },
  "dependencies": {
    "@astrojs/rss": "4.0.19",
    "@astrojs/sitemap": "3.7.4",
    "astro": "7.4.3",
    "sharp": "0.35.5"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.12",
    "@playwright/test": "1.64.1",
    "@types/node": "26.6.5",
    "prettier": "3.9.10",
    "prettier-plugin-astro": "1.1.2",
    "typescript": "6.0.3"
  }
}
```

- [ ] **Step 4: Create the Astro, TypeScript, and formatting config**

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://maztard.github.io',
  base: '/MazenGarden',
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
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
  ],
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`.gitignore`:

```text
node_modules/
dist/
.astro/
tests/.artifacts/
playwright-report/
test-results/
.env
.env.*
!.env.example
Thumbs.db
.DS_Store
```

`.prettierrc.mjs`:

```js
/** @type {import('prettier').Config} */
export default {
  printWidth: 100,
  singleQuote: true,
  plugins: ['prettier-plugin-astro'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
};
```

`.prettierignore`:

```text
dist/
node_modules/
.astro/
tests/.artifacts/
playwright-report/
test-results/
package-lock.json
docs/superpowers/
```

- [ ] **Step 5: Create `src/consts.ts` and `src/utils/url.ts`**

`src/consts.ts`:

```ts
export const SITE_TITLE = 'MazenGarden';
export const SITE_DESCRIPTION =
  'Personal site of Mazen Ragab (Maztardoo): a G12 STEM student into technology, AI, marketing, psychology, and building things.';
export const HOME_TITLE = 'Mazen Ragab (Maztardoo) — Personal Site';
```

`src/utils/url.ts`:

```ts
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
```

- [ ] **Step 6: Create a temporary minimal homepage so the build succeeds**

`src/pages/index.astro`:

```astro
---
import { Font } from 'astro:assets';
import { HOME_TITLE } from '../consts';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{HOME_TITLE}</title>
    <Font cssVariable="--font-dotemp" preload />
    <Font cssVariable="--font-geist-pixel" preload />
  </head>
  <body>
    <h1>MazenGarden</h1>
  </body>
</html>
```

- [ ] **Step 7: Create `playwright.config.ts` and the first failing test**

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4321/MazenGarden/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4321',
    url: 'http://localhost:4321/MazenGarden/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

`tests/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('homepage responds at the production base path', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Mazen Ragab/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('MazenGarden');
});

test('the built page has no Google Fonts requests', async ({ page }) => {
  const googleRequests: string[] = [];
  page.on('request', (request) => {
    const host = new URL(request.url()).hostname;
    if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') {
      googleRequests.push(request.url());
    }
  });

  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);

  expect(googleRequests).toEqual([]);
});
```

- [ ] **Step 8: Install, install Chromium, and verify the failing/passing baseline**

Run: `npm install`
Run: `npx playwright install chromium`
Run: `npm run check`
Expected: pass.

Run: `npm run test:e2e`
Expected: both smoke tests pass; the temporary page exists and the Fonts API built without Google-hosted runtime assets.

- [ ] **Step 9: Commit**

```powershell
git add -A
git commit -m "chore: scaffold Astro site with base-path tooling"
```

---

### Task 2: Site shell, fonts, tokens, and responsive header/footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/styles/global.css`, `public/favicon.svg`, `tests/shell.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `withBase()`, `SITE_TITLE`, `SITE_DESCRIPTION`, `HOME_TITLE`, font CSS variables `--font-dotemp` / `--font-geist-pixel`.
- Produces: `BaseLayout` with props `{ title?: string; description?: string; noindex?: boolean }`; body `main#main`, `.skip-link`, `SiteHeader`, `SiteFooter`.
- Produces: global classes `.container`, `.skip-link`, `.site-header`, `.site-header__inner`, `.site-header__brand`, `.site-nav`, `.site-footer`, `.site-footer__inner`, `.accent`.
- Produces: header nav hrefs `/MazenGarden/`, `/MazenGarden/blog/`, `/MazenGarden/rss.xml`; `aria-current="page"` on Home at `/MazenGarden/`.

- [ ] **Step 1: Write the failing shell test**

`tests/shell.spec.ts` must assert:

- `GET ./` is 200.
- The header has a link named `MazenGarden` to `/MazenGarden/`.
- Primary nav links `Home` → `/MazenGarden/`, `Writing` → `/MazenGarden/blog/`, `RSS` → `/MazenGarden/rss.xml`.
- `Home` has `aria-current="page"` on the homepage.
- `main#main` exists and the skip link targets `#main`.
- The icon link points to `/MazenGarden/favicon.svg`.
- `document.fonts.check('1rem "Dotemp"')` and `document.fonts.check('1rem "Geist Pixel"')` are true after `document.fonts.ready`.
- At 320×568, `document.documentElement.scrollWidth <= clientWidth + 1`.

Run: `npm run build`
Run: `npx playwright test tests/shell.spec.ts`
Expected: fail because the shell does not exist.

- [ ] **Step 2: Create `BaseLayout.astro`**

Use the following structure and props:

```astro
---
import { Font } from 'astro:assets';
import SiteHeader from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { withBase } from '../utils/url';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
  noindex?: boolean;
}

const { title = SITE_TITLE, description = SITE_DESCRIPTION, noindex = false } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site ?? Astro.url.origin);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex" />}
    <link rel="icon" type="image/svg+xml" href={withBase('/favicon.svg')} />
    <link
      rel="alternate"
      type="application/rss+xml"
      title="MazenGarden RSS"
      href={withBase('/rss.xml')}
    />
    <link rel="sitemap" href={withBase('/sitemap-index.xml')} />
    <Font cssVariable="--font-dotemp" preload />
    <Font cssVariable="--font-geist-pixel" preload />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main"><slot /></main>
    <SiteFooter />
  </body>
</html>
```

- [ ] **Step 3: Create `SiteHeader.astro` and `SiteFooter.astro`**

`SiteHeader.astro`:

- Compute `base = import.meta.env.BASE_URL`, `path = Astro.url.pathname`, `isHome = path === base`, `isWriting = path.startsWith(`${base}blog/`)`.
- Brand `<a class="site-header__brand" href={withBase('/')}>MazenGarden</a>`.
- `<nav class="site-nav" aria-label="Primary">` with the three links; set `aria-current={isHome ? 'page' : undefined}` and `aria-current={isWriting ? 'page' : undefined}`.
- No inline styles.

`SiteFooter.astro`:

- `<footer class="site-footer"><div class="container site-footer__inner">…</div></footer>`.
- Left: `© {new Date().getFullYear()} Mazen Ragab`.
- Right: RSS link via `withBase('/rss.xml')`.

- [ ] **Step 4: Create `src/styles/global.css` with tokens, reset, shell, and focus styles**

Required token block:

```css
:root {
  --color-text: #1a1a1a;
  --color-muted: #555;
  --color-accent: #a52a2a;
  --color-link: #0000ee;
  --color-window: #c0c0c0;
  --color-window-bar: #06068e;
  --color-card: #fff;
  --font-body: var(--font-geist-pixel), system-ui, sans-serif;
  --font-display: var(--font-dotemp), 'Courier New', monospace;
  --container: 75rem;
  --gutter: clamp(1.25rem, 4vw, 3.125rem);
  --section-space: clamp(3rem, 8vw, 6rem);
  --radius: 0.5rem;
}
```

Required rules:

- Universal `box-sizing: border-box`; `body` margin 0, body font/body color, white background, `min-height: 100vh`, flex column; `main { flex: 1; padding-bottom: var(--section-space); }`.
- `img { display: block; max-width: 100%; }`.
- `[hidden] { display: none !important; }`.
- `:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 3px; }`.
- `a { color: var(--color-link); }`, `a:hover { color: var(--color-accent); }`.
- `.container { width: min(calc(100% - 2 * var(--gutter)), var(--container)); margin-inline: auto; }`.
- `.skip-link`: absolutely positioned at `top: 0; left: 0`, hidden with `transform: translateY(-150%)` until `:focus`, then visible at top-left with accent background and white text. Do not hide it with a negative horizontal offset; the Task 7 bounds check must not flag it.
- `.site-header`: 2px bottom border, small block padding; `.site-header__inner`: flex, `flex-wrap: wrap`, `justify-content: space-between`, `align-items: baseline`, gap.
- `.site-header__brand`: Dotemp, `font-size: 1.25rem`, no underline, dark text.
- `.site-nav`: flex, wrap, gap, `font-size: 0.9rem`; active `[aria-current="page"]` uses accent and a thicker underline.
- `.site-footer`: top border, `.site-footer__inner` flex/wrap with muted small text.
- `.accent { color: var(--color-accent); }`.
- No `@import`, no `Press Start 2P`, no `font-family` referencing Google-hosted files by URL.

- [ ] **Step 5: Add `public/favicon.svg`**

Create a 16×16 `viewBox` pixel “M” in white on a `#a52a2a` square, with `shape-rendering="crispEdges"`. No external references.

- [ ] **Step 6: Replace the temporary homepage with `BaseLayout`**

`src/pages/index.astro` must import `BaseLayout` and `HOME_TITLE` and pass `title={HOME_TITLE}`. Keep an `<h1>` so the shell test passes; the full hero lands in Task 3.

- [ ] **Step 7: Run the shell test and the full suite**

Run: `npm run build`
Run: `npx playwright test tests/shell.spec.ts`
Expected: pass.

Run: `npm run test:e2e`
Expected: all current tests pass, including the smoke tests.

- [ ] **Step 8: Commit**

```powershell
git add src public tests/shell.spec.ts
git commit -m "feat: add responsive site shell and self-hosted fonts"
```

---

### Task 3: Homepage hero and photo cards

**Files:**
- Create: `src/components/PhotoCard.astro`, `tests/home.spec.ts`
- Modify: `src/pages/index.astro`, `src/styles/global.css`

**Interfaces:**
- Consumes: `BaseLayout`, `withBase`, global tokens.
- Produces: `.hero`, `.hero__title`, `.hero__title-accent`, `.hero__name`, `.hero__bio`, `.section`, `.section__title`, `.section__heading`, `.section__more`, `.card-grid`, `.card`, `.card__image`, `.card__body`, `.card__title`, `.card__text`.
- Produces: `PhotoCard` props `{ image: ImageMetadata; alt: string; title: string }` with a default slot for card copy.

- [ ] **Step 1: Write the failing homepage test**

`tests/home.spec.ts` must assert:

- One `h1` with normalized text `About Me!`.
- Five `.hero__bio p` elements; first contains `Hi, you already know my name!`; last contains `extremely curious`.
- Four `.card` elements; titles in order: `A random sky Image I took`, `A random sky Image I took`, `Walking down the dorms`, `OMG`.
- Four card images; after scrolling to the bottom and waiting for load, each has `naturalWidth > 0`.
- Alt text exactly:
  - `Night sky with a bright moon behind dark leaves`
  - `Dark green leaves against a night sky`
  - `Lit dormitory hallway with tiled walls and doors`
  - `Streetlight glowing over palm leaves at night`
- The second card links to `https://www.instagram.com/papisartisticgarden/`.
- At 1280×900, all four cards have the same rounded `top`.
- At 390×844, the cards have four distinct rounded `top` values.
- At 320×568, no page overflow and every `.hero__bio p` has `scrollWidth <= clientWidth + 1`.

Run: `npm run build`
Run: `npx playwright test tests/home.spec.ts`
Expected: fail because the hero/cards do not exist.

- [ ] **Step 2: Create `PhotoCard.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  image: ImageMetadata;
  alt: string;
  title: string;
}

const { image, alt, title } = Astro.props;
---

<article class="card">
  <Image
    class="card__image"
    src={image}
    alt={alt}
    widths={[320, 480, 640]}
    sizes="(min-width: 64rem) 20rem, (min-width: 40rem) 45vw, 90vw"
    loading="lazy"
    decoding="async"
  />
  <div class="card__body">
    <h3 class="card__title">{title}</h3>
    <p class="card__text"><slot /></p>
  </div>
</article>
```

- [ ] **Step 3: Fill the homepage hero and photo section**

Import the four images from `../assets/images/`. Render this exact content:

- Hero: `<h1 class="hero__title">About <span class="hero__title-accent">Me!</span></h1>`.
- Name: `<p class="hero__name">Mazen Ragab aka <span class="accent">(Maztardoo)</span></p>`.
- Bio paragraphs, verbatim from the pre-refactor `index.html`:
  1. `Hi, you already know my name! I am currently a G12 student at New Cairo STEM School. Even though I am G12, I am 16 years old, which is kinda dope ngl cuz I feel superior lol.`
  2. `A fun fact about me is that I am trying to be a Polymath. I am into multiple stuff. I am into Tech, Marketing, Psychology and Human Behaviour, Business, and honestly a lot of other random things that I find interesting. I really enjoy learning about things outside of what I am supposed to know, especially when I can connect different fields together and use them to create something.`
  3. `I don't really want to limit myself to one specific field or career. I want to explore as much as I can, build things, understand people, learn how businesses work, and develop skills that complement each other. I think the most interesting ideas usually happen when you combine knowledge from completely different areas.`
  4. `Outside of academics, I am also really into building projects and experimenting with ideas. I enjoy taking an idea that sounds stupid at first and trying to turn it into something real. I am especially interested in AI, entrepreneurship, and using technology to solve actual problems.`
  5. `Overall, I would say I am just extremely curious. I like going down random rabbit holes, learning things that have absolutely nothing to do with school, and then somehow finding a way to connect them back to something useful. My goal is basically to become the type of person who can walk into almost any conversation and have something interesting to contribute.`
- Photo section: `<section class="section" id="pics" aria-labelledby="pics-title">`, `h2` `Random Pics in my <em>life</em>`, `<ul class="card-grid">`, four `<li>` entries containing `PhotoCard`.
- Card copy, verbatim:
  1. `Fun Fact! This is one of the first images I took with my new phone.`
  2. `I post these pics on <a href="https://www.instagram.com/papisartisticgarden/">@papisartisticgarden</a>.`
  3. `Nothing <em>crazy</em> I was just walking and took a pic 🤑`
  4. `Was with a couple of my friends and just wanted to take a pic BOOM.`

- [ ] **Step 4: Add hero and card CSS**

Required values:

- `.hero { padding-top: clamp(2rem, 6vw, 5rem); }`.
- `.hero__title { margin: 0; font-family: var(--font-body); font-size: clamp(4rem, 18vw, 12.5rem); font-weight: 400; line-height: 0.85; }`.
- `.hero__title-accent { display: block; margin-left: clamp(2rem, 27vw, 22rem); color: var(--color-accent); font-family: var(--font-display); }`.
- `.hero__name { margin: 1.5rem 0 0; font-family: var(--font-display); font-size: clamp(1.75rem, 6vw, 3.125rem); font-style: italic; font-weight: 800; text-decoration: underline; }`.
- `.hero__bio { max-width: 70ch; margin-top: 2rem; font-size: 0.9rem; }`; `.hero__bio p { margin: 0 0 1em; }`.
- `.section { padding-top: var(--section-space); }`; `.section__title { margin: 0 0 1.5rem; font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.125rem); font-style: italic; font-weight: 800; text-decoration: underline; overflow-wrap: anywhere; }`.
- `.section__heading`: flex, wrap, `justify-content: space-between`, `align-items: baseline`, gap; `.section__more` uses the body font and a normal weight.
- `.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: 1.25rem; margin: 0; padding: 0; list-style: none; }`.
- `.card { overflow: hidden; background: var(--color-card); border-radius: var(--radius); box-shadow: 0 4px 8px rgb(0 0 0 / 0.1); }`.
- `.card__image { width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover; }`.
- `.card__body { padding: 1rem; }`; `.card__title { margin: 0 0 0.5rem; color: #333; font-size: 1.25rem; }`; `.card__text { margin: 0; color: #666; font-size: 0.875rem; line-height: 1.5; }`.

- [ ] **Step 5: Run the homepage and layout checks**

Run: `npm run build`
Run: `npx playwright test tests/home.spec.ts`
Expected: pass.

Run: `npm run test:e2e`
Expected: all current tests pass.

- [ ] **Step 6: Commit**

```powershell
git add src/pages/index.astro src/components/PhotoCard.astro src/styles/global.css tests/home.spec.ts
git commit -m "feat: build homepage hero and optimized photo cards"
```

---

### Task 4: Markdown blog, post pages, and homepage latest writing

**Files:**
- Create: `src/content.config.ts`, `src/content/blog/hello-world.md`, `src/content/blog/draft-example.md`, `src/utils/posts.ts`, `src/utils/date.ts`, `src/components/PostCard.astro`, `src/layouts/BlogPost.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `tests/blog.spec.ts`
- Modify: `src/pages/index.astro`, `src/styles/global.css`

**Interfaces:**
- Consumes: `BaseLayout`, `withBase`, `SITE_DESCRIPTION`.
- Produces: `BlogPost` type alias for `CollectionEntry<'blog'>`; `getPublishedPosts(): Promise<BlogPost[]>`; `postUrl(post: BlogPost): string`; `formatDate(date: Date): string`.
- Produces: content schema `{ title: string; description: string; date: Date; draft: boolean }`; slug from the Markdown filename.
- Produces: `/blog/` and `/blog/hello-world/`; homepage `.post-list` latest writing section with `h2` and `h3` cards.

- [ ] **Step 1: Write the failing blog test**

`tests/blog.spec.ts` must assert:

- `GET blog/` is 200; `h1` is `Writing`; the page contains `Hello, world`; clicking the post title lands on `/MazenGarden/blog/hello-world/`.
- The blog index page title is `Writing · MazenGarden`; the post page title is `Hello, world · MazenGarden`.
- The post page has `h1` `Hello, world`, a `<time>` with text `October 28, 2026`, and body text `Welcome to my corner of the internet`.
- The post page has a link back to `/MazenGarden/blog/`.
- The homepage has a `Latest writing` section containing `Hello, world` and a link to `/MazenGarden/blog/`.
- The homepage latest-writing post title is an `h3`; the blog-index post title is an `h2`.
- The draft post `Draft example` does not appear on the homepage or blog index, and `GET blog/draft-example/` returns 404.
- Every tested page has exactly one `h1`.

Run: `npm run build`
Run: `npx playwright test tests/blog.spec.ts`
Expected: fail because `/blog/` does not exist.

- [ ] **Step 2: Define the collection and starter post**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

`src/content/blog/hello-world.md`:

```markdown
---
title: "Hello, world"
description: "A first note from the garden."
date: 2026-10-28
draft: false
---

Welcome to my corner of the internet. I'll use this space to think out loud about technology, psychology, business, and whatever else catches my attention.

This is a placeholder post. Replace it with your first real entry, or keep it as the start of the archive.
```

`src/content/blog/draft-example.md`:

```markdown
---
title: "Draft example"
description: "A draft that stays out of the production build."
date: 2026-10-28
draft: true
---

This draft is only visible in local development. It proves the draft flag works.
```

- [ ] **Step 3: Add post/date utilities**

`src/utils/posts.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort(
    (a, b) =>
      b.data.date.valueOf() - a.data.date.valueOf() ||
      a.data.title.localeCompare(b.data.title),
  );
}

export function postUrl(post: BlogPost): string {
  return withBase(`/blog/${post.id}/`);
}
```

`src/utils/date.ts`:

```ts
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return formatter.format(date);
}
```

- [ ] **Step 4: Create `PostCard.astro` and `BlogPost.astro`**

`PostCard.astro` props `{ post: BlogPost; headingLevel?: 'h2' | 'h3' }` defaulting to `h2`. Render:

- `<p class="post-card__meta"><time datetime={post.data.date.toISOString()}>{formatDate(post.data.date)}</time></p>`
- A dynamic heading tag (`const Heading = headingLevel`) with class `post-card__title`; inside, `<a href={postUrl(post)}>{post.data.title}</a>`.
- `<p class="post-card__description">{post.data.description}</p>`.

`BlogPost.astro` props `{ post: BlogPost }`. Render `BaseLayout` with title `` `${post.data.title} · MazenGarden` `` and description `post.data.description`. Inside:

- `<article class="post container">`
- Back link `← All writing` → `withBase('/blog/')`.
- `h1.post__title`, then `<time datetime={post.data.date.toISOString()}>{formatDate(post.data.date)}</time>` inside `.post__meta`.
- `<p class="post__lede">{post.data.description}</p>`.
- `<div class="prose"><slot /></div>`.
- Footer back link to `withBase('/blog/')`.

- [ ] **Step 5: Create the blog index and post route**

`src/pages/blog/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { getPublishedPosts } from '../../utils/posts';
import { withBase } from '../../utils/url';

const posts = await getPublishedPosts();
---

<BaseLayout
  title="Writing · MazenGarden"
  description="Notes from Mazen Ragab on technology, psychology, business, and building things."
>
  <div class="container blog-index">
    <header class="page-intro">
      <h1 class="page-title">Writing</h1>
      <p class="page-lede">Notes on whatever I'm curious about.</p>
    </header>
    {
      posts.length === 0 ? (
        <p class="empty-state">No posts yet. Check back soon.</p>
      ) : (
        <ul class="post-list">
          {posts.map((post) => (
            <li>
              <PostCard post={post} headingLevel="h2" />
            </li>
          ))}
        </ul>
      )
    }
    <a class="back-link" href={withBase('/')}>← Back home</a>
  </div>
</BaseLayout>
```

`src/pages/blog/[slug].astro`:

```astro
---
import { render } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';
import { getPublishedPosts } from '../../utils/posts';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<BlogPost post={post}>
  <Content />
</BlogPost>
```

- [ ] **Step 6: Add latest writing to the homepage**

After the hero and before the photo section, fetch `(await getPublishedPosts()).slice(0, 3)`. When non-empty, render:

- `<section class="section" aria-labelledby="writing-title">`
- `.section__heading` with `h2#writing-title` `Latest writing` and `<a class="section__more" href={withBase('/blog/')}>All posts →</a>`.
- `<ul class="post-list">` with `<PostCard post={post} headingLevel="h3" />` inside each `<li>`.
- When empty, omit the section entirely.

- [ ] **Step 7: Add blog, post, and prose CSS**

Required rules:

- `.blog-index { max-width: 52rem; }`.
- `.page-title { margin: 0; font-family: var(--font-display); font-size: clamp(2.5rem, 8vw, 4rem); font-style: italic; font-weight: 800; text-decoration: underline; overflow-wrap: anywhere; }`.
- `.page-lede { max-width: 60ch; margin: 1rem 0 0; color: var(--color-muted); }`.
- `.post-list { display: grid; gap: 1.5rem; max-width: 52rem; margin: 2rem 0 0; padding: 0; list-style: none; }`.
- `.post-card { padding-left: 1rem; border-left: 4px solid var(--color-accent); }`.
- `.post-card__meta { margin: 0; color: #666; font-size: 0.8rem; }`.
- `.post-card__title { margin: 0.25rem 0 0.5rem; font-family: var(--font-display); font-size: clamp(1.5rem, 4vw, 2rem); overflow-wrap: anywhere; }`.
- `.post-card__title a { color: var(--color-text); text-decoration: none; }`; hover uses accent.
- `.post-card__description { max-width: 65ch; margin: 0; color: #555; }`.
- `.post { max-width: 68ch; padding-block: var(--section-space); }`.
- `.post__back, .back-link { display: inline-block; margin-bottom: 1.5rem; }`.
- `.post__title { margin: 0; font-family: var(--font-display); font-size: clamp(2rem, 7vw, 3.5rem); line-height: 1; overflow-wrap: anywhere; }`.
- `.post__meta { margin: 1rem 0 0; color: #666; font-size: 0.9rem; }`.
- `.post__lede { margin: 1rem 0 0; color: #444; font-size: 1.05rem; }`.
- `.prose { margin-top: 2rem; font-size: 1rem; line-height: 1.7; }`.
- `.prose h2, .prose h3, .prose h4 { font-family: var(--font-display); line-height: 1.15; }`.
- `.prose a { color: var(--color-link); }`; `.prose strong { font-weight: 700; }`.
- `.prose blockquote { margin-left: 0; padding-left: 1rem; border-left: 4px solid var(--color-accent); color: #555; }`.
- `.prose pre { max-width: 100%; overflow-x: auto; padding: 1rem; background: #f4f4f4; }`.
- `.prose code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }`.
- `.prose table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }`.
- `.prose img { max-width: 100%; height: auto; }`.
- `.prose :where(p, li, h2, h3, h4, a) { overflow-wrap: anywhere; }`.

- [ ] **Step 8: Run the blog and full tests**

Run: `npm run check`
Expected: content schema and types pass.

Run: `npm run build`
Run: `npx playwright test tests/blog.spec.ts`
Expected: pass.

Run: `npm run test:e2e`
Expected: all current tests pass.

- [ ] **Step 9: Commit**

```powershell
git add src/content.config.ts src/content src/utils src/components/PostCard.astro src/layouts/BlogPost.astro src/pages src/styles/global.css tests/blog.spec.ts
git commit -m "feat: add Markdown blog and homepage latest writing"
```

---

### Task 5: Projects window and working close button

**Files:**
- Create: `src/components/ProjectsWindow.astro`, `tests/projects.spec.ts`
- Modify: `src/pages/index.astro`, `src/styles/global.css`

**Interfaces:**
- Consumes: `withBase` not required for the external EmadEats link; global tokens.
- Produces: `section#projects` with `h2#projects-title`; `button.window__close[type="button"][data-close][aria-label="Close projects window"]`; classes `.window`, `.window__bar`, `.window__title`, `.window__body`, `.window__icon`, `.projects`, `.projects__link`, `.projects__name`.
- Produces: click behavior that sets `#projects.hidden = true`; a second programmatic click is a no-op.

- [ ] **Step 1: Write the failing projects test**

`tests/projects.spec.ts` must assert:

- `#projects` is visible and contains `Other Projects`.
- The EmadEats link points to `https://emadeats.vercel.app`.
- The section text contains `BuggyEyes` and `Sudany` and does **not** contain `]`.
- Clicking `[data-close]` sets `#projects.hidden` to true and leaves no page errors.
- Programmatically invoking the button’s `click()` a second time does not throw and the section stays hidden.
- At 320×568, the window’s right edge is within the viewport.

Run: `npm run build`
Run: `npx playwright test tests/projects.spec.ts`
Expected: fail because the window does not exist.

- [ ] **Step 2: Create `ProjectsWindow.astro`**

Markup:

```astro
<section class="section" id="projects" aria-labelledby="projects-title">
  <div class="container">
    <div class="window">
      <div class="window__bar">
        <h2 class="window__title" id="projects-title">Other Projects</h2>
        <button
          class="window__close"
          type="button"
          data-close
          aria-label="Close projects window"
        >✕</button>
      </div>
      <div class="window__body">
        <!-- copy the cart SVG paths from the pre-refactor index.html:71-92;
             add class="window__icon" and aria-hidden="true" -->
        <ul class="projects">
          <li><a class="projects__link" href="https://emadeats.vercel.app">EmadEats Project</a></li>
          <li><span class="projects__name">BuggyEyes</span></li>
          <li><span class="projects__name">Sudany</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

Script, bundled by Astro and deferred automatically:

```ts
const closeButton = document.querySelector('[data-close]');
const projectsSection = document.getElementById('projects');

if (closeButton instanceof HTMLButtonElement && projectsSection) {
  closeButton.addEventListener('click', () => {
    projectsSection.hidden = true;
    closeButton.blur();
  });
}
```

- [ ] **Step 3: Add the window to the homepage**

Import `ProjectsWindow` in `src/pages/index.astro` and render it after the photo section, before `</BaseLayout>`/the end of the page.

- [ ] **Step 4: Add window CSS**

Required:

- `.window { width: min(100%, 34rem); margin-inline: auto; background: var(--color-window); filter: drop-shadow(8px 1px 4px rgb(0 0 0 / 0.2)); }`.
- `.window__bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.125rem 0.125rem 0.125rem 0.5rem; background: var(--color-window-bar); color: #fff; }`.
- `.window__title { margin: 0 auto 0 0; font-family: var(--font-display); font-size: 1rem; font-weight: 400; }`.
- `.window__close`: 24px square, `flex: 0 0 auto`, centered, 12px bold Arial, gray background, bevel borders and inset shadow matching the original `.close-btn` (light top/left, dark bottom/right; active inverts).
- `.window__body { padding: 1rem; }`; `.window__icon { display: block; margin-bottom: 0.5rem; }`.
- `.projects { display: grid; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }`.
- `.projects__link, .projects__name { font-family: var(--font-display); font-size: 1rem; }`; `.projects__name { color: #333; }`.
- No fixed window height; no percentage margin.

- [ ] **Step 5: Run the projects and full tests**

Run: `npm run test:e2e`
Expected: all tests pass, including the close behavior.

- [ ] **Step 6: Commit**

```powershell
git add src/components/ProjectsWindow.astro src/pages/index.astro src/styles/global.css tests/projects.spec.ts
git commit -m "feat: make the projects window closable"
```

---

### Task 6: RSS, sitemap checks, robots, 404, and metadata

**Files:**
- Create: `src/pages/rss.xml.ts`, `src/pages/404.astro`, `public/robots.txt`, `tests/feeds.spec.ts`
- Modify: `src/pages/index.astro` (pass homepage title/description); verify `public/favicon.svg` created in Task 2

**Interfaces:**
- Consumes: `getPublishedPosts()`, `postUrl()`, `SITE_TITLE`, `SITE_DESCRIPTION`, `BaseLayout`, `withBase`.
- Produces: `/MazenGarden/rss.xml` with base-prefixed item links; `/MazenGarden/sitemap-index.xml` + `sitemap-0.xml`; `/MazenGarden/robots.txt`; `/MazenGarden/404.html`.
- Produces: canonical, RSS alternate, and sitemap links on every page.

- [ ] **Step 1: Write the failing feed/metadata test**

`tests/feeds.spec.ts` must assert:

- `GET rss.xml` is 200, content type contains `xml`, and the body contains `https://maztard.github.io/MazenGarden/blog/hello-world/` but not `draft-example`.
- `GET sitemap-index.xml` is 200 and contains `https://maztard.github.io/MazenGarden/sitemap-0.xml`.
- `GET sitemap-0.xml` is 200, contains the homepage, `/blog/`, and `/blog/hello-world/` base URLs, and does not contain `/404` or `draft-example`.
- `GET robots.txt` is 200 and contains `Sitemap: https://maztard.github.io/MazenGarden/sitemap-index.xml`.
- `GET does-not-exist/` returns 404, an `h1` `404`, `<meta name="robots" content="noindex">`, and a home link to `/MazenGarden/`.
- Homepage canonical is `https://maztard.github.io/MazenGarden/`; blog canonical is `https://maztard.github.io/MazenGarden/blog/`; post canonical is `https://maztard.github.io/MazenGarden/blog/hello-world/`.
- Every page has an RSS alternate link and sitemap link with the `/MazenGarden/` prefix.
- The built homepage HTML contains neither `fonts.googleapis.com` nor `fonts.gstatic.com`.

Run: `npm run build`
Run: `npx playwright test tests/feeds.spec.ts`
Expected: fail because the routes/files do not exist.

- [ ] **Step 2: Create `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPublishedPosts, postUrl } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  const site = new URL(import.meta.env.BASE_URL, context.site ?? context.url.origin);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: site.href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
    })),
    customData: '<language>en-us</language>',
  });
}
```

- [ ] **Step 3: Create `public/robots.txt`**

```text
User-agent: *
Allow: /

Sitemap: https://maztard.github.io/MazenGarden/sitemap-index.xml
```

- [ ] **Step 4: Create the 404 page**

`src/pages/404.astro` uses `BaseLayout` with:

- `title="Page not found · MazenGarden"`, `description="The page you were looking for does not exist."`, `noindex`.
- A `.section` / `.container` / `.not-found` block.
- `<h1 class="page-title">404</h1>`.
- A short “This page wandered off.” lede.
- `<a class="back-link" href={withBase('/')}>← Back home</a>`.

- [ ] **Step 5: Pass explicit homepage metadata**

In `src/pages/index.astro`, pass `title={HOME_TITLE}` and `description={SITE_DESCRIPTION}` to `BaseLayout`. Confirm the blog index and `BlogPost` layout already pass their own titles/descriptions.

- [ ] **Step 6: Run the feed tests and full suite**

Run: `npm run check`
Run: `npm run build`
Run: `npx playwright test tests/feeds.spec.ts`
Expected: pass.

Run: `npm run test:e2e`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```powershell
git add src/pages/rss.xml.ts src/pages/404.astro src/pages/index.astro public/robots.txt public/favicon.svg tests/feeds.spec.ts
git commit -m "feat: add RSS, sitemap checks, robots, and 404"
```

---

### Task 7: Full responsive matrix and screenshot QA

**Files:**
- Create: `tests/layout.spec.ts`, `tests/screenshots.spec.ts`
- Modify: `src/styles/global.css` only if the matrix finds overflow or clipping

**Interfaces:**
- Consumes: all routes and selectors from Tasks 2–6.
- Produces: coverage of `/`, `/blog/`, and `/blog/hello-world/` at 320, 390, 768, and 1280; screenshots in `tests/.artifacts/`.

- [ ] **Step 1: Write the layout matrix test**

`tests/layout.spec.ts` must, for each page path `['./', 'blog/', 'blog/hello-world/']` and each viewport `[320, 390, 768, 1280]`:

- Set the viewport, navigate, await `document.fonts.ready`, scroll to the bottom once, wait 250ms, then scroll back.
- Assert `document.documentElement.scrollWidth <= clientWidth + 1`.
- Assert no `body *` element with nonzero width has `right > clientWidth + 0.5` or `left < -0.5`.
- Assert every image is `complete && naturalWidth > 0`.
- Assert exactly one `h1`.
- Assert heading levels never increase by more than one in DOM order.
- Assert every `img` has a non-empty `alt`.
- Assert no element has an inline `style` attribute.
- Assert every same-origin `a[href^="/"]` starts with `/MazenGarden/`.
- Collect same-origin requests of type document, stylesheet, script, font, and image; assert each pathname starts with `/MazenGarden/` and each response status is below 400.
- For the homepage only, assert every `.hero__bio p` has `scrollWidth <= clientWidth + 1`.

Also assert:

- At 1280, the four `.card` elements have the same rounded `top`.
- At 390, the four `.card` elements have four distinct rounded `top` values.
- `src/styles/global.css` contains no `@import` and no `Press Start 2P`.
- The old files `index.html` and `styles.css` do not exist.

Run: `npm run build`
Run: `npx playwright test tests/layout.spec.ts`
Expected: pass after any small CSS fixes; if it fails, adjust only the offending token/clamp/rule.

- [ ] **Step 2: Write the screenshot test**

`tests/screenshots.spec.ts`:

- `mkdir('tests/.artifacts', { recursive: true })`.
- Navigate at 1280×900, await fonts, capture `tests/.artifacts/desktop-1280.png` with `fullPage: true`.
- Resize to 390×844, reload, await fonts, capture `tests/.artifacts/mobile-390.png`.
- Resize to 320×568, reload, await fonts, capture `tests/.artifacts/mobile-320.png`.
- No pixel comparison.

- [ ] **Step 3: Run the full suite and inspect screenshots**

Run: `npm run test:e2e`
Expected: all tests pass; the three PNGs exist.

Open and inspect:

- Desktop: “About” left-aligned with “Me!” indented in brown; underlined name; four cards in one row; centered window no wider than 34rem; no stray bracket.
- Mobile 390/320: no clipped hero, name, section title, bio, cards, or window; one card per row; no horizontal scrollbar.
- Blog index and post page: readable prose, no overflow, date visible.

- [ ] **Step 4: Fix drift and re-run**

If a screenshot shows drift, change only the responsible token or clamp value in `src/styles/global.css`. Re-run:

`npm run test:e2e`

Expected: all pass.

- [ ] **Step 5: Commit**

```powershell
git add tests/layout.spec.ts tests/screenshots.spec.ts src/styles/global.css
git commit -m "test: cover responsive layout and capture visual QA"
```

---

### Task 8: GitHub Pages workflow and README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: `package.json` build script, `dist/` output, `site`/`base` config.
- Produces: automatic build/deploy on pushes to `main`; documented one-time Pages setting and Markdown authoring workflow.

- [ ] **Step 1: Create the deployment workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Build with Astro
        uses: withastro/action@v6
        with:
          node-version: 24
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Rewrite `README.md`**

Include:

- Project overview and the retro identity.
- What’s inside: About, Random Pics, Projects, Writing.
- Tech: Astro 7, TypeScript strict, Markdown content collection, Astro Fonts API, Astro image optimization, Playwright.
- Getting started: `npm install`, `npx playwright install chromium` (once), `npm run dev`.
- Writing a post: path `src/content/blog/my-post.md`, the frontmatter example (`title`, `description`, `date`, `draft`), slug rules, and draft behavior.
- Scripts table: `dev`, `build`, `preview`, `check`, `test:e2e`, `test`, `format`, `format:check`.
- Deployment: pushes to `main` run `.github/workflows/deploy.yml`; one-time GitHub Settings → Pages → Source = **GitHub Actions**; live base URL.
- Project structure summary.
- Note that CMS support is not included, but the Markdown schema is Decap-compatible.
- Node >= 22.23.4 requirement.

- [ ] **Step 3: Format and verify the workflow/docs**

Run: `npm run format`
Run: `npm run format:check`
Expected: pass; Prettier parses the YAML.

Run: `npm run check`
Expected: pass.

Run: `npm run test:e2e`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```powershell
git add .github/workflows/deploy.yml README.md
git commit -m "chore: add GitHub Pages deployment and rewrite README"
```

---

### Task 9: Final verification and handoff

**Files:**
- No planned source changes; fix only what verification exposes.

- [ ] **Step 1: Run the complete verification set**

Run: `npm run format:check`
Expected: pass.

Run: `npm run check`
Expected: pass.

Run: `npm run test:e2e`
Expected: `0 failed`; all Playwright tests pass.

- [ ] **Step 2: Verify the production build shape**

Run: `npm run build`
Then confirm:

- `dist/index.html`, `dist/blog/index.html`, `dist/blog/hello-world/index.html`, `dist/rss.xml`, `dist/sitemap-index.xml`, `dist/sitemap-0.xml`, `dist/404.html`, and `dist/robots.txt` exist.
- `dist/_astro/` contains hashed CSS, JS, image, and font assets.
- `dist/index.html` contains `/MazenGarden/` asset URLs and no `fonts.googleapis.com` / `fonts.gstatic.com`.

- [ ] **Step 3: Confirm no unintended files or commits**

Run: `git status --short`
Expected: clean tree except ignored `tests/.artifacts/`, `dist/`, `node_modules/`, `.astro/`.

Run: `git log --oneline -10`
Expected: the design/plan commit, scaffold, shell, homepage, blog, projects, feeds, layout tests, and deployment/docs commits.

- [ ] **Step 4: Handoff**

Report:

- The branch name and commit list.
- The exact verification commands and results.
- The production URLs to check after the user pushes.
- The one manual step: GitHub Settings → Pages → Source = **GitHub Actions**.
- That no push was performed.

---

## Self-Review

**Spec coverage:** Stack/config (Task 1), fonts + shell + responsive base (Task 2), homepage hero/photos (Task 3), blog collection/routes/latest writing (Task 4), close button (Task 5), RSS/sitemap/robots/404/metadata (Task 6), full mobile matrix/screenshots (Task 7), deployment/README (Task 8), final verification (Task 9). Non-goals stay out of every task.

**Step scan:** Each step has one action and a checkable result. Exact copy, paths, class names, selectors, token values, commands, and expected outcomes are pinned. No TBDs.

**Type consistency:** `withBase`, `SITE_TITLE`, `SITE_DESCRIPTION`, `HOME_TITLE`, `BlogPost`, `getPublishedPosts`, `postUrl`, `formatDate`, `PhotoCard`, `PostCard`, `BlogPost`, `ProjectsWindow`, `#projects`, and `[data-close]` are named consistently across tasks and tests.

**Review Focus:** Base-path drift is covered in Tasks 1, 2, 6, and 7; 320px overflow in Tasks 3 and 7; runtime Google Fonts in Tasks 1, 2, and 6; feed/sitemap/blog mismatch in Tasks 4 and 6; dead close button in Task 5.

**Proportion:** The plan pins decisions and tests; CSS bodies are limited to values that change the layout, and components are specified by interface plus markup contract rather than full-file transcripts.
