# MazenGarden: Astro rebuild + blog

**Date:** 2026-10-28
**Status:** Proposed — awaiting approval
**Scope:** Project
**Repo:** `D:\personalweb-copy` (copy of `maztard/MazenGarden`)

## Intent

MazenGarden is currently one hand-written HTML page and one stylesheet. The page has no viewport tag, no semantic landmarks, thirteen inline styles, a broken close button, fixed pixel offsets that overflow on phones, and no way to publish writing. The user wants a clean, maintainable personal site with the same content and retro pixel identity, working mobile layout, and a blog.

The blog should feel like part of the site rather than a separate product. Publishing now means adding a Markdown file and pushing; the content model must stay compatible with adding Decap CMS later without moving or rewriting posts.

Success looks like: a post is one Markdown file, the site works from 320px up, every page is built as static HTML, deployment is automated on GitHub Pages, and a future CMS can plug into the same Markdown collection.

## Goals

- Rebuild the page in Astro as static output with semantic, componentized markup.
- Preserve all existing copy and the retro pixel identity; fix the stray `]` and split the bio into five readable paragraphs.
- Make the layout fluid from 320px through desktop with no horizontal overflow.
- Add a `/blog/` index and individual Markdown post pages.
- Add a homepage “Latest writing” section, a site header/nav, and a minimal footer.
- Keep the projects window and make its close button work.
- Self-host both fonts at build time and remove the unused Press Start 2P import.
- Add RSS, sitemap, robots.txt, a 404 page, and base-path-safe internal URLs.
- Deploy to the existing GitHub Pages project site `https://maztard.github.io/MazenGarden/` through GitHub Actions.
- Verify structure, layout at four widths, blog routes, feed/sitemap, and close behavior with Playwright, `astro check`, and Prettier.

## Non-goals

- No CMS/admin UI, authentication, or Decap configuration in this pass.
- No comments, newsletter, search, tags, pagination, analytics, or dark mode.
- No custom domain.
- No new project URLs; BuggyEyes and Sudany remain non-links.
- No rewrite of the bio voice or photography content.
- No post images, MDX, or custom components inside posts.
- No visual-regression snapshots; screenshots are for human inspection only.
- No push to `origin` and no GitHub settings changes by the agent.

## Constraints

- Target the existing repository and deployment URL; do not create a new repo.
- Node >= 22.23.4 (Astro 7 requirement). Local environment is Node 26.7.0 / npm 12.1.0.
- npm and a committed `package-lock.json`.
- Static output only; no server runtime.
- All internal URLs must work under the `/MazenGarden/` base path in both development and production.
- Content must remain plain Markdown with simple frontmatter, readable by Decap later.
- Local commits only. `origin` points at the real GitHub repo.

## Current state (evidence)

- `index.html` is 101 lines: no viewport meta, no `h1`, no `<main>` or `<header>`, 13 inline `style` attributes, a stray `]` after BuggyEyes, and a close button with no behavior.
- `styles.css` is 112 lines: Google Fonts imported twice (HTML and CSS), Press Start 2P imported but unused, a 200px hero, a 350px hero offset, 50px headings, 300px fixed cards, a 40%-wide/200px-tall projects window, a `margin-right: 69%` title hack, and no media queries.
- Hero content needs roughly 700px today; the projects window is 40% wide with a fixed height; the photo row is 3 + 1 on desktop.
- Photos are 1440×1440 (`sky1`) or 958×1280 (the other three), about 520KB total.
- Live site: `https://maztard.github.io/MazenGarden/` (200, title “Maztard Own Website”). GitHub Pages is currently served from a branch; `gh` is not installed, so the Pages source change is a manual user step.
- The repo is on `main`, tracking `origin/main`; only `docs/` is untracked. No product code has been changed yet.
- The earlier vanilla refactor spec and plan are obsolete and will be removed during implementation.

## Approaches considered

1. **Astro static site with content collections — chosen.** Astro outputs static HTML, supports Markdown collections with typed schemas, has built-in font and image APIs, and pairs with official RSS/sitemap integrations. Components keep the homepage and blog consistent, and only the projects-window close button ships JavaScript. Fits GitHub Pages directly.
2. **Next.js App Router.** Strong React ecosystem and CMS integrations, but more framework machinery, client runtime, and configuration than a mostly static personal site needs. The site would pay for React everywhere to get a Markdown blog.
3. **Eleventy (11ty).** A lean static generator with Markdown and templates. It would work, but fonts, images, typed content, and component ergonomics require more manual wiring; the result would be less cohesive for the same amount of work.

Astro wins because the site is content-first, static, and small, while the blog will grow. It gives the clean component boundaries and Markdown workflow the user asked for without turning a personal page into an application.

## Design

### Stack and project shape

- Astro 7.4.3, `output: 'static'`, TypeScript strict, npm.
- `@astrojs/rss` 4.0.19 and `@astrojs/sitemap` 3.7.4.
- `@astrojs/check` 0.9.12, TypeScript 6.0.3, `@playwright/test` 1.64.1, Prettier 3.9.10, `prettier-plugin-astro` 1.1.2.
- `sharp` for Astro’s image optimization (Astro 7 lists it as an optional dependency; pin it explicitly so image builds are reliable).
- Scaffold Astro manually in place rather than running an interactive generator over a non-empty repo. The existing git history is preserved.
- Work on a local feature branch. Commit locally; never push.

### File layout

```text
.github/workflows/deploy.yml
public/
  favicon.svg
  robots.txt
src/
  assets/
    fonts/Dotemp-8bit.ttf
    images/{sky1,sky2,dorm1,random1}.jpeg
  components/
    SiteHeader.astro
    SiteFooter.astro
    PhotoCard.astro
    ProjectsWindow.astro
    PostCard.astro
  content/
    blog/hello-world.md
  layouts/
    BaseLayout.astro
    BlogPost.astro
  pages/
    404.astro
    index.astro
    rss.xml.ts
    blog/
      index.astro
      [slug].astro
  styles/global.css
  utils/
    date.ts
    posts.ts
    url.ts
  consts.ts
  content.config.ts
astro.config.mjs
package.json
package-lock.json
tsconfig.json
playwright.config.ts
.prettierrc.mjs
.prettierignore
.gitignore
README.md
```

Old assets move rather than duplicate: `fonts/Dotemp-8bit.ttf` → `src/assets/fonts/`, `imgs/*.jpeg` → `src/assets/images/`. The old `index.html`, `styles.css`, `fonts/`, and `imgs/` are removed after the move. `ascii-text-art.png` and `imgs/ascii-art-text (1).png` are unreferenced and deleted.

### Routes and URLs

| Route | Output | Purpose |
|---|---|---|
| `/MazenGarden/` | `dist/index.html` | Homepage: hero, latest writing, photos, projects |
| `/MazenGarden/blog/` | `dist/blog/index.html` | All posts, newest first |
| `/MazenGarden/blog/[slug]/` | `dist/blog/[slug]/index.html` | One post |
| `/MazenGarden/rss.xml` | `dist/rss.xml` | RSS 2.0 feed |
| `/MazenGarden/sitemap-index.xml` | generated | Sitemap index |
| `/MazenGarden/404.html` | `dist/404.html` | Custom not-found page |
| `/MazenGarden/robots.txt` | copied from `public/` | Crawler policy + sitemap URL |

`astro.config.mjs` sets:

```js
site: 'https://maztard.github.io',
base: '/MazenGarden',
trailingSlash: 'always',
```

`trailingSlash: 'always'` makes `import.meta.env.BASE_URL` end in `/` and keeps canonical, feed, and sitemap URLs consistent.

### Base-path contract

All internal links go through a single helper, `src/utils/url.ts`:

```ts
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
```

Examples: `withBase('/')` → `/MazenGarden/`; `withBase('/blog/')` → `/MazenGarden/blog/`; `withBase('/#pics')` → `/MazenGarden/#pics`.

- Components never hardcode `/MazenGarden/`; they call `withBase`.
- Imported assets (photos, fonts, CSS) are handled by Astro/Vite and inherit the base automatically.
- `robots.txt` and `astro.config.mjs` are the only places the base string is written literally; tests catch drift.
- Canonical URLs use `Astro.url.pathname`, which already includes the base.

### Content model

`src/content.config.ts` defines one `blog` collection with the `glob()` loader:

```ts
loader: glob({ base: './src/content/blog', pattern: '*.md' })
```

Posts are flat files; the filename is the slug (`hello-world.md` → `/blog/hello-world/`). Frontmatter:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Post title and browser title |
| `description` | string | yes | Blog list excerpt, meta description, RSS description |
| `date` | date | yes | `YYYY-MM-DD`; displayed in UTC to avoid off-by-one timezone dates |
| `draft` | boolean | no (default `false`) | Shows in dev; omitted from production builds |

No tags, cover images, authors, or custom fields in this pass. The shape is deliberately simple so Decap’s `string`, `text`, `datetime`, and `boolean` widgets can map to it later.

`src/utils/posts.ts` provides:

- `getPublishedPosts()`: fetches the collection, filters drafts in production, and sorts newest first (title as a deterministic tie-breaker).
- `postUrl(post)`: `withBase(\`/blog/${post.id}/\`)`.

`src/utils/date.ts` formats dates with `Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })`.

The starter post is `hello-world.md`, titled “Hello, world”, dated 2026-10-28, with a short real intro and a line telling the user to replace it. It is a placeholder for the first real entry, not lorem ipsum.

### Layout and components

`BaseLayout.astro` owns the document shell:

- `<head>`: charset, viewport, per-page title, description, canonical, optional `noindex`, favicon, RSS alternate link, sitemap link, and the two Astro `<Font>` components.
- Body: skip link → `SiteHeader` → `<main id="main"><slot /></main>` → `SiteFooter`.
- Page components never render their own `<html>`, `<head>`, header, or footer.

`SiteHeader.astro`:

- Brand “MazenGarden” linking home, in Dotemp.
- Nav: Home (`/`), Writing (`/blog/`), RSS (`/rss.xml`), all via `withBase`.
- Active link gets `aria-current="page"` and the brown accent; active state is derived from `Astro.url.pathname`.
- At narrow widths the brand and nav wrap instead of overflowing.

`SiteFooter.astro`: one line with the current year, “Mazen Ragab”, and an RSS link. No social icons.

`PhotoCard.astro`: props `image: ImageMetadata`, `alt`, `title`; renders `<article class="card">` with an Astro `<Image>` and a body slot. The parent supplies the `<li>` and the card copy.

`PostCard.astro`: props `post` and optional `headingLevel` (`h2` or `h3`); renders date, linked title, and description. No duplicate “read more” link.

`ProjectsWindow.astro`: renders the retro window and its close button; contains the small inline Astro `<script>` that hides `#projects` on click. The script is null-safe and does nothing if either element is absent.

`BlogPost.astro`: props `post`; wraps `BaseLayout` and renders the back link, `h1`, date, description as a lede, the Markdown body inside `.prose`, and a footer back link.

### Page content

**Homepage (`src/pages/index.astro`)**, in this order:

1. **Hero** (inside main): `h1` “About Me!” with “Me!” on its own line in brown Dotemp; name “Mazen Ragab aka (Maztardoo)” with the handle in brown; the existing bio split into five `<p>` elements at the existing sentence breaks.
2. **Latest writing**: `h2` “Latest writing” plus an “All posts →” link; up to three `PostCard`s at `h3`. The section is omitted if there are no published posts.
3. **Random Pics in my life**: `h2` with italic “life”; four cards in a `<ul>` with the existing titles and copy, the Instagram link on the second card, and the italic “crazy” preserved on the third. Card headings become `h3`.
4. **Other Projects**: the `ProjectsWindow` section, `h2` title, cart SVG with `aria-hidden="true"`, EmadEats link, and BuggyEyes/Sudany as plain names. The stray `]` is gone.

Homepage title: “Mazen Ragab (Maztardoo) — Personal Site”. Description: “Personal site of Mazen Ragab (Maztardoo): a G12 STEM student into technology, AI, marketing, psychology, and building things.”

**Blog index (`src/pages/blog/index.astro`)**:

- `h1` “Writing” and a one-line lede (“Notes on whatever I’m curious about.” or equivalent, in the site’s voice).
- Vertical list of published posts, newest first, each with date, title (`h2`), and description.
- “← Back home” link.
- If empty: “No posts yet. Check back soon.”

**Post page (`src/pages/blog/[slug].astro`)**:

- `getStaticPaths` maps each published post to `{ params: { slug: post.id }, props: { post } }`.
- Renders `<BlogPost post={post}><Content /></BlogPost>` after `render(post)`.
- Title: `{post.data.title} · MazenGarden`; description: `post.data.description`.
- Back links to `/blog/`; date is a `<time datetime={...}>`.

**404 (`src/pages/404.astro`)**:

- `h1` “404”, short “This page wandered off.” message, link home.
- `noindex`.
- Astro emits `dist/404.html`, which GitHub Pages serves for the project site.

### Visual system

The retro identity stays, but the layout becomes fluid.

**Tokens** (in `src/styles/global.css`):

- Text `#1a1a1a`; accent brown `#a52a2a`; link `#0000ee`; window `#c0c0c0`; window bar `#06068e`; card white.
- Body `var(--font-geist-pixel)`; display `var(--font-dotemp)`; fallbacks `system-ui, sans-serif` and `Courier New, monospace`.
- Container `75rem`; gutter `clamp(1.25rem, 4vw, 3.125rem)`; section space `clamp(3rem, 8vw, 6rem)`; radius `0.5rem`.

**Type and layout**:

- Hero `clamp(4rem, 18vw, 12.5rem)`; “Me!” offset `clamp(2rem, 27vw, 22rem)`.
- Name `clamp(1.75rem, 6vw, 3.125rem)`; section headings `clamp(2rem, 5vw, 3.125rem)`; post titles `clamp(2rem, 7vw, 3.5rem)`.
- Container `width: min(calc(100% - 2 * var(--gutter)), var(--container)); margin-inline: auto`.
- Cards: `repeat(auto-fit, minmax(min(100%, 17rem), 1fr))`, gap `1.25rem`; four across at 1280px, two at tablet, one on phones.
- Card image: `aspect-ratio: 3 / 2; object-fit: cover; width: 100%; height: auto`.
- Projects window: `width: min(100%, 34rem); margin-inline: auto; height: auto`; bar uses flex with `justify-content: space-between`; no percentage-margin hack.
- Prose: max width 68ch, line-height 1.7, headings in Dotemp, code blocks and tables scroll horizontally, long URLs wrap.
- Focus visible: 3px brown outline with offset on all links/buttons.
- Body copy sits at normal weight for readability; Dotemp headings keep the synthetic 800/italic treatment because the font has one cut. This preserves the display look while making paragraphs easier to read on phones.
- No animation or transition that needs a reduced-motion query; no decorative JS.

**Navigation and footer** use a simple 2px rule, small pixel type, and the brown accent; no extra chrome.

### Fonts

`astro.config.mjs` uses Astro’s Fonts API:

- Local Dotemp: `fontProviders.local()`, `name: 'Dotemp'`, `cssVariable: '--font-dotemp'`, one variant from `./src/assets/fonts/Dotemp-8bit.ttf` at weight 400 / normal.
- Google Geist Pixel: `fontProviders.google()`, `name: 'Geist Pixel'`, `cssVariable: '--font-geist-pixel'`, `weights: [400]`, `styles: ['normal']`, `subsets: ['latin']`, fallback `sans-serif`.

`BaseLayout` renders `<Font cssVariable="--font-dotemp" preload />` and `<Font cssVariable="--font-geist-pixel" preload />`. Fonts are downloaded at build time and served from `_astro/fonts`; the production site makes no requests to Google. CSS aliases the generated variables as `--font-body` and `--font-display`.

### Projects window close

- Button: `<button type="button" class="window__close" data-close aria-label="Close projects window">✕</button>`.
- Script: find `[data-close]` and `#projects`; on click, set `projectsSection.hidden = true`, then `closeButton.blur()`. A second click is a no-op because the section is already hidden and the button is gone.
- `[hidden] { display: none !important; }` in the reset prevents author CSS from overriding it.
- No restore affordance; a reload brings the window back.

### Metadata, feeds, and crawlers

- Each page has a unique title and description; canonical uses the base-prefixed pathname.
- `<link rel="alternate" type="application/rss+xml">` points at `/MazenGarden/rss.xml`.
- `<link rel="sitemap">` points at `/MazenGarden/sitemap-index.xml`.
- RSS: title “MazenGarden”, site description, channel `site` at the base URL, published posts newest first, each item with title, description, `pubDate`, and a base-prefixed link. No full-content feed.
- Sitemap: `@astrojs/sitemap` configured with no options; the integration combines `site` + `base` (verified in its source). 404 is excluded automatically.
- `public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://maztard.github.io/MazenGarden/sitemap-index.xml
```

- `public/favicon.svg`: a tiny pixel “M” mark in the site’s brown/white palette, linked from every page.
- No Open Graph images or social cards in this pass.

### Authoring workflow

To publish:

1. Create `src/content/blog/my-post.md`.
2. Add frontmatter: `title`, `description`, `date`, optional `draft: true`.
3. Write Markdown.
4. Run `npm run dev` to preview.
5. Commit and push; GitHub Actions rebuilds and deploys.

`draft: true` hides a post from the production build but shows it in local dev. Post slug changes when the filename changes; no redirects yet.

### CMS path (later)

The collection is Decap-ready:

- Posts are flat Markdown with `title`, `description`, `date`, and `draft`.
- Decap can target `src/content/blog` directly with a `folder` collection and map the fields to `string`, `text`, `datetime`, and `boolean` widgets.
- Adding the CMS later means adding `public/admin/` and authentication; no content migration or frontmatter rewrite.
- GitHub Pages + Decap requires an OAuth proxy; that is a future deployment concern, not part of this pass.

### Deployment

`.github/workflows/deploy.yml`:

- Trigger on pushes to `main` and manual dispatch.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Build job: `actions/checkout@v7`, then `withastro/action@v6` with Node 24 (Astro 7 needs >= 22.23.4; the action defaults to 24).
- Deploy job: `actions.deploy-pages@v5`, `github-pages` environment.
- Concurrency group `pages`, `cancel-in-progress: false`.

One-time manual step: in the GitHub repo, Settings → Pages → Build and deployment → Source = **GitHub Actions**. Until the first successful workflow, the old branch-deployed site remains. The user performs the push and the settings change; the agent does not.

### Verification

Automated:

- `npm run check` — `astro check`, strict TypeScript and content schema.
- `npm run build` — static build.
- `npm run test:e2e` — builds, starts `astro preview` at `http://localhost:4321/MazenGarden/`, and runs Playwright.
- `npm run format:check` — Prettier with the Astro plugin.

Playwright coverage, against the built output at the production base path:

- Homepage renders the `h1`, five bio paragraphs, four images, four cards, and the projects window.
- Close button hides `#projects`; second activation is a no-op; no console errors.
- Nav and all internal links point under `/MazenGarden/`; no hardcoded root-relative links.
- Every same-origin request (document, CSS, JS, fonts, images) succeeds and starts with `/MazenGarden/`; no runtime requests to Google Fonts.
- Both fonts load (`document.fonts.check`).
- No horizontal page overflow and no clipped bio at 320, 390, 768, and 1280 on `/`, `/blog/`, and a post.
- Four cards share one row at 1280; cards stack at 390.
- Blog index lists the starter post; clicking it reaches the post; post title, date, and body render.
- RSS returns XML with base-prefixed item links; sitemap index and `sitemap-0.xml` list base-prefixed URLs; robots points at the sitemap; 404 returns the custom page.
- Heading order never skips; every page has exactly one `h1`; every image has non-empty alt text.

Human QA:

- Capture full-page screenshots at 1280×900 and 390×844 into `tests/.artifacts/` (gitignored) and inspect them.
- Check the 320px layout for wrapped headings, stacked cards, and a window that fits.
- Compare the desktop hero and photo row against the original site for identity drift.
- After the user pushes, check the live Pages URLs and the GitHub Actions run.

## Migration sequence

1. Scaffold the Astro project in place, move fonts/photos, and remove the obsolete vanilla files and assets.
2. Build the layout, header/footer, homepage components, and global styles.
3. Add the blog collection, starter post, blog index, post page, and 404.
4. Add RSS, sitemap, robots, favicon, metadata, and base-path helper.
5. Add the deployment workflow and rewrite the README.
6. Add Playwright/config/tooling, run the full suite, inspect screenshots, and commit locally.

The implementation plan will break this into reviewable tasks with exact file contracts and checks.

## Risks and trade-offs

- **Base-path mistakes** are the most likely failure. The helper, the production-base Playwright server, and a request-path assertion are the guardrails.
- **Fonts API build-time download** requires network during build. Runtime visitors get self-hosted files; if the build is offline, it fails at build time rather than shipping a broken page.
- **Image optimization** changes filenames and formats (WebP) and may subtly alter photo appearance. Visual QA covers it; originals stay in git.
- **Deployment cutover** is manual and briefly disruptive: changing Pages source to GitHub Actions means the old branch deployment stops. The first successful workflow restores the site at the same URL.
- **Homepage additions** (header, footer, latest writing) are deliberate visual changes. The content, palette, and pixel type stay.
- **Synthetic bold/italic** on Dotemp/Geist Pixel remains; these fonts have one cut, and the synthesis is part of the current look.
- **One starter post** makes the blog look sparse; it is a real intro and is meant to be replaced.
- **GitHub Pages 404 behavior** cannot be fully reproduced locally; the build emits the correct `404.html`, and the live check confirms it.
- **The old vanilla docs** are removed to avoid someone implementing a stale plan.

## Open questions

None blocking. Two design calls are worth flagging for approval:

- User-facing label “Writing” with URL `/blog/` (rather than calling both “Blog”).
- Homepage order puts “Latest writing” before the photo cards, so the new work is visible without scrolling past the photos.

If either should be different, it is a small change before implementation.
