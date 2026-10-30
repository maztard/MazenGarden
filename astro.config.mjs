// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isVercel = Boolean(process.env.VERCEL);

// When deployed to Vercel, the site is hosted at the root ('/').
// When deployed to GitHub Pages, the site is hosted at the repo subpath ('/MazenGarden').
const base = process.env.BASE_PATH ?? (isVercel ? '/' : '/MazenGarden');

const site =
  process.env.SITE_URL ||
  (isVercel && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : isVercel && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://maztard.github.io');

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  redirects: {
    '/blog': '/',
  },
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
