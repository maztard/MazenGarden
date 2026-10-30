import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.describe('Typography, Fonts & Emoji System', () => {
  test('SerenityOS Emoji font file and license attribution files exist', () => {
    expect(fs.existsSync(path.resolve('src/assets/fonts/SerenityOS-Emoji.ttf'))).toBe(true);
    expect(fs.existsSync(path.resolve('src/assets/fonts/Dotemp-8bit.ttf'))).toBe(true);
    expect(fs.existsSync(path.resolve('src/assets/emoji/1f911.svg'))).toBe(true);
    expect(fs.existsSync(path.resolve('public/licenses/SerenityOS-Emoji.txt'))).toBe(true);
    expect(fs.existsSync(path.resolve('public/licenses/PixelTwemoji.txt'))).toBe(true);
    expect(fs.existsSync(path.resolve('THIRD_PARTY_NOTICES.md'))).toBe(true);
  });

  test('global.css includes SerenityOS Emoji in font-face and font-family stacks', () => {
    const cssContent = fs.readFileSync(path.resolve('src/styles/global.css'), 'utf-8');
    expect(cssContent).toContain("@font-face");
    expect(cssContent).toContain("font-family: 'SerenityOS Emoji'");
    expect(cssContent).toContain("../assets/fonts/SerenityOS-Emoji.ttf");
    expect(cssContent).toContain("--font-body: var(--font-geist-pixel), 'SerenityOS Emoji'");
    expect(cssContent).toContain("--font-display: var(--font-dotemp), 'SerenityOS Emoji'");
  });

  test('PixelEmoji component source handles image discovery and fallback', () => {
    const componentContent = fs.readFileSync(path.resolve('src/components/ui/PixelEmoji.astro'), 'utf-8');
    expect(componentContent).toContain("import.meta.glob");
    expect(componentContent).toContain("/src/assets/emoji/*.svg");
    expect(componentContent).toContain("image-rendering: pixelated");
    expect(componentContent).toContain("image-rendering: crisp-edges");
  });
});
