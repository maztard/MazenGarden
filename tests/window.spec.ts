import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('DesktopWindow component exists and satisfies slot-based Win95 window specifications', () => {
  const windowPath = resolve('src/components/desktop/DesktopWindow.astro');
  expect(existsSync(windowPath)).toBe(true);

  const content = readFileSync(windowPath, 'utf-8');

  // Uses PixelIcon component
  expect(content).toContain("import PixelIcon from '../ui/PixelIcon.astro'");

  // Props interface definition
  expect(content).toContain('interface Props');
  expect(content).toContain('windowId: string');
  expect(content).toContain('windowTitle: string');
  expect(content).toContain('icon?: string');
  expect(content).toContain('isOpen?: boolean');
  expect(content).toContain('class?: string');
  expect(content).toContain('style?: string');

  // Root window element with dialog semantics and styling
  expect(content).toContain("class:list={['desktop-window', className]}");
  expect(content).toContain('data-window={windowId}');
  expect(content).toContain('id={`window-${windowId}`}');
  expect(content).toContain('hidden={!isOpen}');
  expect(content).toContain('style={style}');
  expect(content).toContain('role="dialog"');
  expect(content).toContain('aria-labelledby={`title-${windowId}`}');

  // Window title bar with drag handle and title
  expect(content).toContain('class="desktop-window__bar"');
  expect(content).toContain('data-window-handle');
  expect(content).toContain('{icon && <PixelIcon name={icon} size={16} />}');
  expect(content).toContain('<span class="desktop-window__title" id={`title-${windowId}`}>');

  // Close button with data-window-close and close PixelIcon
  expect(content).toContain('class="desktop-window__close"');
  expect(content).toContain('type="button"');
  expect(content).toContain('data-window-close');
  expect(content).toContain('aria-label={`Close ${windowTitle}`}');
  expect(content).toContain('<PixelIcon name="close" size={12} />');

  // Window body containing a pure slot with no iframes
  expect(content).toContain('class="desktop-window__body"');
  expect(content).toContain('<slot />');
  expect(content).not.toContain('<iframe');
});
