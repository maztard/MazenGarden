/**
 * Win95 Single-Page Desktop Window Manager
 * Handles window dragging, click-to-front z-index stacking,
 * dock toggle buttons, close buttons, 24h clock, and in-window blog reader navigation.
 */

let highestZ = 100;
let isInitialized = false;

function getBasePath(): string {
  let base = '/';
  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    base = import.meta.env.BASE_URL;
  } else if (typeof window !== 'undefined' && window.location.pathname.startsWith('/MazenGarden')) {
    base = '/MazenGarden/';
  }
  return base.endsWith('/') ? base : `${base}/`;
}

export function isDragDisabled(): boolean {
  if (typeof window === 'undefined') return true;
  const isSmallScreen = window.innerWidth <= 900 || window.matchMedia('(max-width: 900px)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  return isSmallScreen || isCoarsePointer;
}

export function bringToFront(windowEl: HTMLElement): void {
  highestZ += 1;
  windowEl.style.zIndex = String(highestZ);

  // Focus title bar of current window, unfocus others
  const allBars = document.querySelectorAll<HTMLElement>(
    '.desktop-window__bar, [data-window-handle]',
  );
  allBars.forEach((bar) => bar.classList.remove('desktop-window__bar--focused'));

  const currentBar = windowEl.querySelector<HTMLElement>(
    '.desktop-window__bar, [data-window-handle]',
  );
  if (currentBar) {
    currentBar.classList.add('desktop-window__bar--focused');
  }
}

export function updateTopmostFocus(): void {
  const openWindows = Array.from(document.querySelectorAll<HTMLElement>('[data-window]')).filter(
    (w) => !w.hidden,
  );

  const allBars = document.querySelectorAll<HTMLElement>(
    '.desktop-window__bar, [data-window-handle]',
  );
  allBars.forEach((b) => b.classList.remove('desktop-window__bar--focused'));

  if (openWindows.length === 0) return;

  let topmost = openWindows[0];
  let maxZ = parseInt(topmost.style.zIndex || '0', 10);

  for (let i = 1; i < openWindows.length; i++) {
    const z = parseInt(openWindows[i].style.zIndex || '0', 10);
    if (z > maxZ) {
      maxZ = z;
      topmost = openWindows[i];
    }
  }

  const topBar = topmost.querySelector<HTMLElement>('.desktop-window__bar, [data-window-handle]');
  if (topBar) {
    topBar.classList.add('desktop-window__bar--focused');
  }
}

export function isWindowTopmost(win: HTMLElement): boolean {
  if (win.hidden) return false;
  const currentZ = parseInt(win.style.zIndex || '0', 10);
  const otherOpenWindows = Array.from(
    document.querySelectorAll<HTMLElement>('[data-window]'),
  ).filter((w) => w !== win && !w.hidden);

  for (const other of otherOpenWindows) {
    const otherZ = parseInt(other.style.zIndex || '0', 10);
    if (otherZ >= currentZ) {
      return false;
    }
  }
  return true;
}

export function closeWindow(win: HTMLElement): void {
  win.hidden = true;
  const windowId = win.getAttribute('data-window');
  if (windowId) {
    const dockBtn = document.querySelector<HTMLElement>(`[data-dock-toggle="${windowId}"]`);
    if (dockBtn) {
      dockBtn.classList.remove('dock-button--active');
    }
  }
  const bar = win.querySelector<HTMLElement>('.desktop-window__bar, [data-window-handle]');
  if (bar) {
    bar.classList.remove('desktop-window__bar--focused');
  }
  updateTopmostFocus();
}

export function setupWindowDragging(win: HTMLElement, handle: HTMLElement): void {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let grabOffsetX = 0;
  let grabOffsetY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  handle.addEventListener('pointerdown', (e: PointerEvent) => {
    // Disabled on screens <= 900px or coarse pointers
    if (isDragDisabled() || e.pointerType === 'touch') {
      return;
    }

    // Don't drag if interacting with controls inside handle (e.g. close button)
    if (
      (e.target as HTMLElement).closest('[data-window-close], button, a, input, select, textarea')
    ) {
      return;
    }

    isDragging = true;
    bringToFront(win);
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors in testing/virtual environments
    }

    const stage = document.querySelector<HTMLElement>('.desktop-stage') || document.body;
    const rect = win.getBoundingClientRect();
    const container = (win.offsetParent as HTMLElement) || stage;
    const containerRect = container.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;
    grabOffsetX = e.clientX - rect.left;
    grabOffsetY = e.clientY - rect.top;
    initialLeft = rect.left - containerRect.left;
    initialTop = rect.top - containerRect.top;
  });

  handle.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Only switch to absolute positioning once actual drag movement occurs (> 3px)
    // to prevent reflowing / layout jumps of sibling elements on simple clicks
    if (win.style.position !== 'absolute') {
      if (Math.hypot(dx, dy) < 3) return;
      win.style.position = 'absolute';
      win.style.left = `${initialLeft}px`;
      win.style.top = `${initialTop}px`;
      win.style.margin = '0';
      win.style.bottom = 'auto';
      win.style.right = 'auto';
    }

    const stage = document.querySelector<HTMLElement>('.desktop-stage') || document.body;
    const stageRect = stage.getBoundingClientRect();
    const container = (win.offsetParent as HTMLElement) || stage;
    const containerRect = container.getBoundingClientRect();

    const newLeft = e.clientX - grabOffsetX - containerRect.left;
    const newTop = e.clientY - grabOffsetY - containerRect.top;

    const winWidth = win.offsetWidth;
    const winHeight = win.offsetHeight;

    const offsetX = stageRect.left - containerRect.left;
    const offsetY = stageRect.top - containerRect.top;

    // Clamped relative to the stage bounds:
    // horizontally: at least 80px remains on screen/stage
    const minLeft = offsetX + Math.min(0, 80 - winWidth);
    const maxLeft = offsetX + Math.max(Math.min(0, 80 - winWidth), stage.clientWidth - 80);

    // vertically: stays inside stage bounds
    const minTop = offsetY;
    const maxTop = offsetY + Math.max(0, stage.clientHeight - winHeight);

    const clampedLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    const clampedTop = Math.max(minTop, Math.min(newTop, maxTop));

    win.style.left = `${clampedLeft}px`;
    win.style.top = `${clampedTop}px`;
  });

  const stopDragging = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      handle.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }
  };

  handle.addEventListener('pointerup', stopDragging);
  handle.addEventListener('pointercancel', stopDragging);
}

export function updateClock(): void {
  const clockElements = document.querySelectorAll<HTMLElement>('[data-dock-clock], [data-clock]');
  if (!clockElements.length) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  const fullDateString = now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const fullLabel = `${fullDateString} ${timeString}`;

  clockElements.forEach((el) => {
    el.textContent = timeString;
    el.setAttribute('title', fullLabel);
    el.setAttribute('aria-label', fullLabel);
    if (el.tagName.toLowerCase() === 'time') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      el.setAttribute('datetime', `${year}-${month}-${day}T${timeString}`);
    }
  });
}

export function initBlogReader(): void {
  const writingLinks = document.querySelectorAll<HTMLAnchorElement>('[data-writing-link]');
  const backButtons = document.querySelectorAll<HTMLElement>('[data-writing-back]');
  const writingList = document.querySelector<HTMLElement>('[data-writing-list]');
  const writingPosts = document.querySelectorAll<HTMLElement>('[data-writing-post]');
  const writingWindow = document.querySelector<HTMLElement>('[data-window="writing"]');
  const writingDockBtn = document.querySelector<HTMLElement>('[data-dock-toggle="writing"]');

  function showArticle(slug: string, updateHistory = true, url?: string): void {
    if (writingWindow) {
      writingWindow.hidden = false;
      bringToFront(writingWindow);
      if (writingDockBtn) {
        writingDockBtn.classList.add('dock-button--active');
      }
    }

    if (writingList) {
      writingList.hidden = true;
    }

    writingPosts.forEach((post) => {
      const postSlug = post.getAttribute('data-writing-post');
      const isTarget = postSlug === slug;
      post.hidden = !isTarget;
      if (isTarget) {
        post.scrollTop = 0;
      }
    });

    if (updateHistory && url) {
      history.pushState(null, '', url);
    }
  }

  function showList(updateHistory = true): void {
    writingPosts.forEach((post) => {
      post.hidden = true;
    });

    if (writingList) {
      writingList.hidden = false;
    }

    if (updateHistory) {
      history.pushState(null, '', getBasePath());
    }
  }

  writingLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // Allow opening in new tab or window via modifier keys
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const slug = link.getAttribute('data-writing-link');
      if (slug) {
        showArticle(slug, true, link.href);
      }
    });
  });

  backButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showList(true);
    });
  });

  window.addEventListener('popstate', () => {
    const pathname = window.location.pathname;
    const match = pathname.match(/\/blog\/([^/]+)/);
    if (match && match[1]) {
      showArticle(match[1], false);
    } else {
      showList(false);
    }
  });
}

export function initDesktopHeroActions(): void {
  const computerBtn = document.querySelector<HTMLElement>('[data-hero-action="computer"]');
  if (computerBtn) {
    computerBtn.addEventListener('click', () => {
      const photosWin = document.querySelector<HTMLElement>('[data-window="photos"]');
      if (photosWin) {
        photosWin.hidden = false;
        const dockBtn = document.querySelector<HTMLElement>('[data-dock-toggle="photos"]');
        if (dockBtn) dockBtn.classList.add('dock-button--active');
        bringToFront(photosWin);
      }
      const target =
        document.querySelector<HTMLElement>('#about-me') ||
        document.querySelector<HTMLElement>('#main') ||
        document.querySelector<HTMLElement>('.desktop-stage');
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const folderBtn = document.querySelector<HTMLElement>('[data-hero-action="folder"]');
  if (folderBtn) {
    folderBtn.addEventListener('click', () => {
      const projectsWin = document.querySelector<HTMLElement>('[data-window="projects"]');
      if (projectsWin) {
        projectsWin.hidden = false;
        const dockBtn = document.querySelector<HTMLElement>('[data-dock-toggle="projects"]');
        if (dockBtn) dockBtn.classList.add('dock-button--active');
        bringToFront(projectsWin);
      }
      const target =
        document.querySelector<HTMLElement>('#main') ||
        document.querySelector<HTMLElement>('.desktop-stage');
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const trashBtn = document.querySelector<HTMLElement>('[data-hero-action="trash"]');
  if (trashBtn) {
    trashBtn.addEventListener('click', () => {
      const rssWin = document.querySelector<HTMLElement>('[data-window="rss"]');
      if (rssWin) {
        rssWin.hidden = false;
        const dockBtn = document.querySelector<HTMLElement>('[data-dock-toggle="rss"]');
        if (dockBtn) dockBtn.classList.add('dock-button--active');
        bringToFront(rssWin);
      }
      const target =
        document.querySelector<HTMLElement>('#main') ||
        document.querySelector<HTMLElement>('.desktop-stage');
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const exploreBtn = document.querySelector<HTMLElement>('[data-scroll-explore]');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const target =
        document.querySelector<HTMLElement>('#main') ||
        document.querySelector<HTMLElement>('.desktop-stage');
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

export function initWindowManager(force = false): void {
  if (isInitialized && !force) return;
  isInitialized = true;

  const windows = Array.from(document.querySelectorAll<HTMLElement>('[data-window]'));
  const dockButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-dock-toggle]'));

  // Initialize z-index and click/focus-to-front
  windows.forEach((win, index) => {
    const baseZ = 100 + index;
    win.style.zIndex = String(baseZ);
    highestZ = Math.max(highestZ, baseZ);

    win.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('[data-window-close]')) {
        return;
      }
      bringToFront(win);
    });

    win.addEventListener('focusin', () => {
      bringToFront(win);
    });

    const handle = win.querySelector<HTMLElement>('[data-window-handle]');
    if (handle) {
      setupWindowDragging(win, handle);
    }
  });

  // Close buttons
  const closeButtons = document.querySelectorAll<HTMLElement>('[data-window-close]');
  closeButtons.forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest<HTMLElement>('[data-window]');
      if (win) {
        closeWindow(win);
      }
    });
  });

  // Dock toggle buttons
  dockButtons.forEach((dockBtn) => {
    dockBtn.addEventListener('click', () => {
      const windowId = dockBtn.getAttribute('data-dock-toggle');
      if (!windowId) return;
      const win = document.querySelector<HTMLElement>(`[data-window="${windowId}"]`);
      if (!win) return;

      if (win.hidden) {
        // Closed -> open and bring to front
        win.hidden = false;
        dockBtn.classList.add('dock-button--active');
        bringToFront(win);
      } else if (isWindowTopmost(win)) {
        // Open and topmost -> close
        closeWindow(win);
      } else {
        // Open and behind -> bring to front
        bringToFront(win);
        dockBtn.classList.add('dock-button--active');
      }
    });
  });

  // Responsive reset on resize: clear fixed positioning if <= 900px
  window.addEventListener('resize', () => {
    if (isDragDisabled()) {
      windows.forEach((win) => {
        win.style.position = '';
        win.style.left = '';
        win.style.top = '';
        win.style.margin = '';
        win.style.bottom = '';
        win.style.right = '';
      });
    }
  });

  // Initial title bar focus
  updateTopmostFocus();

  // In-window blog reader
  initBlogReader();

  // Desktop hero icon actions
  initDesktopHeroActions();

  // 24h clock update every 15s (singleton guard)
  if (!(window as unknown as { __dockClockInit?: boolean }).__dockClockInit) {
    (window as unknown as { __dockClockInit?: boolean }).__dockClockInit = true;
    updateClock();
    setInterval(updateClock, 15000);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initWindowManager());
  } else {
    initWindowManager();
  }
}
