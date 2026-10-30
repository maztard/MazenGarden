import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { icons } from '../src/data/icons';

test('PixelIcon component exists and defines expected properties', () => {
  const pixelIconPath = resolve('src/components/ui/PixelIcon.astro');
  expect(existsSync(pixelIconPath)).toBe(true);

  const content = readFileSync(pixelIconPath, 'utf-8');
  expect(content).toContain("import { icons } from '../../data/icons'");
  expect(content).toContain('viewBox="0 0 16 16"');
  expect(content).toContain('shape-rendering="crispEdges"');
  expect(content).toContain('<rect');
});

test('DesktopBanner component exists and satisfies retro landscape banner requirements', () => {
  const bannerPath = resolve('src/components/desktop/DesktopBanner.astro');
  expect(existsSync(bannerPath)).toBe(true);

  const content = readFileSync(bannerPath, 'utf-8');

  // Imports PixelIcon
  expect(content).toContain("import PixelIcon from '../ui/PixelIcon.astro'");

  // Retro landscape wallpaper with sky gradient, clouds, grassy hills, and dither pattern
  expect(content).toContain('class="desktop-banner__wallpaper"');
  expect(content).toContain('<svg');
  expect(content).toContain('id="db-sky"');
  expect(content).toContain('id="db-hill-far"');
  expect(content).toContain('id="db-hill-near"');
  expect(content).toContain('id="db-cloud"');
  expect(content).toContain('id="db-dither"');

  // Top-left desktop icons row: My Computer, Folder, Recycle Bin
  expect(content).toContain('class="desktop-banner__icons"');
  expect(content).toContain('data-desktop-icon="computer"');
  expect(content).toContain('data-desktop-icon="folder"');
  expect(content).toContain('data-desktop-icon="trash"');
  expect(content).toContain('My Computer');
  expect(content).toContain('Folder');
  expect(content).toContain('Recycle Bin');

  // Uses icons from src/data/icons.ts
  expect(icons['computer']).toBeDefined();
  expect(icons['folder']).toBeDefined();
  expect(icons['trash']).toBeDefined();

  // Centered bold title and subtitle
  expect(content).toContain('PORTFOLIO');
  expect(content).toContain('PAPI’S ARTISTIC GARDEN');
  expect(content).toContain('by Mazen Ragab');

  // Full-viewport hero banner styling and interactive scroll/action elements
  expect(content).toContain('min-height: 100vh');
  expect(content).toContain('data-hero-action="computer"');
  expect(content).toContain('data-hero-action="folder"');
  expect(content).toContain('data-hero-action="trash"');
  expect(content).toContain('data-scroll-explore');
  expect(content).not.toContain('desktop-banner__system-strip');
});
