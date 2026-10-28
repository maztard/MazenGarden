# MazenGarden

Personal portfolio and digital space for **Mazen Ragab** ([@maztard](https://github.com/maztard)), a 16-year-old student at New Cairo STEM School.

Built with a retro, pixelated aesthetic: a self-hosted 8-bit typeface, pixel-drawn display font, bevelled retro windows, and custom photo cards — now powered by Astro.

> **Live site:** https://maztard.github.io/MazenGarden/

---

## What's Inside

- **About Me**: Bio covering polymath interests across tech, AI, psychology, marketing, and project building.
- **Random Pics**: Photo cards showcasing sky shots (featured on [@papisartisticgarden](https://www.instagram.com/papisartisticgarden/)), dorm life, and daily moments.
- **Projects Window**: Retro desktop-style window linking to other projects:
  - [EmadEats](https://emadeats.vercel.app)
  - BuggyEyes
  - Sudany
- **Writing**: A Markdown-powered blog at [`/blog/`](https://maztard.github.io/MazenGarden/blog/) with [RSS](https://maztard.github.io/MazenGarden/rss.xml) and a [sitemap](https://maztard.github.io/MazenGarden/sitemap-index.xml).

---

## Tech Stack

- **Astro 7** with TypeScript (strict mode)
- **Markdown content collection** for blog posts (type-safe frontmatter via Zod)
- **Astro Fonts API**: [Dotemp-8bit](src/assets/fonts) is self-hosted locally; Geist Pixel is fetched at build time and self-hosted in the build output. No Google Fonts requests at runtime.
- **Astro image optimization** for photo cards
- **Playwright** end-to-end tests
- Prettier for formatting

---

## Getting Started

Requirements: **Node >= 22.23.4** and npm.

```bash
git clone https://github.com/maztard/MazenGarden.git
cd MazenGarden
npm install
npx playwright install chromium # one-time, for e2e tests
npm run dev
```

The dev server runs at `http://localhost:4321/MazenGarden/`.

---

## Writing a Post

Create a flat Markdown file at `src/content/blog/my-post.md` with this frontmatter:

```yaml
---
title: My Post
description: A short summary shown on cards and used for SEO and RSS.
date: 2026-10-28
draft: false
---
```

- The slug is the filename: `my-post.md` becomes `/blog/my-post/`.
- Posts marked `draft: true` are visible in `npm run dev` only; they are excluded from production builds, RSS, and the sitemap.
- No CMS is included, but the frontmatter schema is Decap-compatible.

---

## Scripts

| Script                 | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start the Astro dev server                      |
| `npm run build`        | Build the production site to `dist/`            |
| `npm run preview`      | Preview the production build locally            |
| `npm run check`        | Run `astro check` (TypeScript diagnostics)      |
| `npm run test:e2e`     | Build, then run the Playwright end-to-end suite |
| `npm run test`         | Run `check` and `test:e2e` together             |
| `npm run format`       | Format all files with Prettier                  |
| `npm run format:check` | Verify formatting without writing               |

---

## Deployment

Pushes to `main` automatically build and deploy via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (using Astro's official GitHub Action). Manual runs are available through `workflow_dispatch`.

One-time setup: GitHub → **Settings → Pages → Source: GitHub Actions**.

The site deploys to https://maztard.github.io/MazenGarden/ (the `base` in `astro.config.mjs` is `/MazenGarden`, with trailing slashes on all routes).

---

## Project Structure

```
src/
  assets/            # Local fonts and images
  components/        # PhotoCard, PostCard, ProjectsWindow, SiteHeader, SiteFooter
  content/blog/      # Flat Markdown blog posts
  layouts/           # BaseLayout, BlogPost
  pages/             # index, 404, blog/[slug], rss.xml
  styles/            # global.css
  utils/             # date, posts, url helpers
  content.config.ts  # Blog collection schema
tests/               # Playwright end-to-end specs
public/              # Static files (robots.txt, favicon, ...)
```
