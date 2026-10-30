import { test, expect } from '@playwright/test';
import { apps } from '../src/data/apps';
import { icons } from '../src/data/icons';

test('app registry defines the 5 floating applications', () => {
  expect(apps).toHaveLength(5);
  expect(apps.map((a) => a.id)).toEqual(['photos', 'socials', 'projects', 'writing', 'rss']);
  expect(apps.find((a) => a.id === 'photos')?.defaultOpen).toBe(true);
  expect(apps.find((a) => a.id === 'socials')?.defaultOpen).toBe(true);
  expect(apps.find((a) => a.id === 'projects')?.defaultOpen).toBe(false);
  expect(apps.find((a) => a.id === 'writing')?.defaultOpen).toBe(false);
  expect(apps.find((a) => a.id === 'rss')?.defaultOpen).toBe(false);
});

test('icons registry contains required desktop and window icons with valid coordinates', () => {
  const required = [
    'computer',
    'folder',
    'trash',
    'photos',
    'contact',
    'projects',
    'writing',
    'rss',
    'close',
    'pin',
    'flower',
  ];

  for (const name of required) {
    expect(icons[name], `Missing icon: ${name}`).toBeDefined();
    expect(icons[name].length).toBeGreaterThan(0);
    for (const [x, y] of icons[name]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(15);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(15);
    }
  }
});
