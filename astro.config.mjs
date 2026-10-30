// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://maztard.github.io',
  base: '/MazenGarden',
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
