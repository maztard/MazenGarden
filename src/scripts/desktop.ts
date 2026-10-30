/**
 * Win95 Single-Page Desktop Window Manager
 * Handles window dragging, click-to-front z-index stacking,
 * dock toggle buttons, close buttons, and in-window blog reader navigation.
 */

let highestZ = 100;

function bringToFront(windowEl: HTMLElement): void {
  highestZ += 1;
  windowEl.style.zIndex = String(highestZ);
}

function setupWindowDragging(win: HTMLElement, handle: HTMLElement): void {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  handle.addEventListener('pointerdown', (e: PointerEvent) => {
    // If clicked on close button or any interactive element inside handle, don't drag
    if ((e.target as HTMLElement).closest('[data-window-close]')) {
      return;
    }

    isDragging = true;
    bringToFront(win);
    handle.setPointerCapture(e.pointerId);

    const rect = win.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    // Switch to fixed positioning so window can float freely across desktop
    win.style.position = 'fixed';
    win.style.left = `${initialLeft}px`;
    win.style.top = `${initialTop}px`;
    win.style.margin = '0';
  });

  handle.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const newLeft = initialLeft + dx;
    const newTop = initialTop + dy;

    const winWidth = win.offsetWidth;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Boundary clamping: keep window on-screen and above the bottom dock
    const dockHeight = 40;
    const clampedLeft = Math.max(0, Math.min(newLeft, viewportWidth - winWidth));
    const clampedTop = Math.max(0, Math.min(newTop, viewportHeight - dockHeight - 30));

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

function initBlogReader(): void {
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
      post.hidden = postSlug !== slug;
      if (postSlug === slug) {
        post.scrollTop = 0;
      }
    });

    if (updateHistory && url) {
      history.pushState({ slug }, '', url);
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
      const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      const rootUrl = canonical?.href || '/MazenGarden/';
      history.pushState({}, '', rootUrl);
    }
  }

  writingLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
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

export function initWindowManager(): void {
  const windows = Array.from(document.querySelectorAll<HTMLElement>('[data-window]'));
  const dockButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-dock-toggle]'));

  // Initialize z-index and click-to-front
  windows.forEach((win, index) => {
    win.style.zIndex = String(100 + index);
    highestZ = Math.max(highestZ, 100 + index);

    win.addEventListener('pointerdown', () => {
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
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const win = btn.closest<HTMLElement>('[data-window]');
      if (!win) return;
      win.hidden = true;
      const windowId = win.getAttribute('data-window');
      if (windowId) {
        const dockBtn = document.querySelector<HTMLElement>(`[data-dock-toggle="${windowId}"]`);
        if (dockBtn) {
          dockBtn.classList.remove('dock-button--active');
        }
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
        win.hidden = false;
        dockBtn.classList.add('dock-button--active');
        bringToFront(win);
      } else {
        const currentZ = parseInt(win.style.zIndex || '0', 10);
        if (currentZ < highestZ) {
          bringToFront(win);
        } else {
          win.hidden = true;
          dockBtn.classList.remove('dock-button--active');
        }
      }
    });
  });

  // In-window blog reader
  initBlogReader();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWindowManager);
  } else {
    initWindowManager();
  }
}
