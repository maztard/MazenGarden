import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { apps } from '../src/data/apps';

test('DockButton component exists and conforms to structural specifications', () => {
  const dockButtonPath = resolve('src/components/desktop/DockButton.astro');
  expect(existsSync(dockButtonPath)).toBe(true);

  const content = readFileSync(dockButtonPath, 'utf-8');

  // Imports
  expect(content).toContain("import type { AppDefinition } from '../../data/apps'");
  expect(content).toContain("import PixelIcon from '../ui/PixelIcon.astro'");

  // Props interface
  expect(content).toContain('interface Props');
  expect(content).toContain('app: AppDefinition');
  expect(content).toContain('isActive?: boolean');
  expect(content).toContain('class?: string');

  // Root button element with accessibility and toggle hooks
  expect(content).toContain('<button');
  expect(content).toContain('type="button"');
  expect(content).toContain(
    "class:list={['dock-button', { 'dock-button--active': isActive }, className]}",
  );
  expect(content).toContain('data-dock-toggle={app.id}');
  expect(content).toContain('aria-label={app.label}');
  expect(content).toContain('title={app.label}');

  // Renders PixelIcon and label span
  expect(content).toContain('<PixelIcon name={app.icon} size={16} />');
  expect(content).toContain('{app.label}');
  expect(content).toContain('dock-button__label');
});

test('DesktopDock component exists and satisfies Win95 taskbar dock requirements', () => {
  const dockPath = resolve('src/components/desktop/DesktopDock.astro');
  expect(existsSync(dockPath)).toBe(true);

  const content = readFileSync(dockPath, 'utf-8');

  // Imports apps registry and DockButton
  expect(content).toContain("import { apps } from '../../data/apps'");
  expect(content).toContain("import DockButton from './DockButton.astro'");
  expect(content).toContain("import PixelIcon from '../ui/PixelIcon.astro'");

  // Container attributes: role="region" aria-label="Taskbar" or role="toolbar"
  expect(content).toMatch(/role=["'](?:region|toolbar)["']/);
  expect(content).toContain('aria-label="Taskbar"');

  // Classic Win95 Start button on the left with flower icon and label
  expect(content).toContain('dock__start');
  expect(content).toContain('type="button"');
  expect(content).toContain('<PixelIcon name="flower" size={16} />');
  expect(content).toContain('Start');

  // App buttons row rendering DockButton for each app in apps
  expect(content).toContain('apps.map');
  expect(content).toContain('<DockButton');
  expect(content).toContain('role="toolbar"');

  // All 5 app IDs from src/data/apps.ts are covered
  expect(apps.map((a) => a.id)).toEqual(['photos', 'socials', 'projects', 'writing', 'rss']);

  // System tray with live clock element (data-dock-clock or data-clock)
  expect(content).toContain('dock__tray');
  expect(content).toContain('data-dock-clock');
  expect(content).toContain('data-clock');
  expect(content).toContain('<time');

  // Live clock client script updating time and localized date label
  expect(content).toContain('toLocaleTimeString');
  expect(content).toContain('toLocaleDateString');
});
