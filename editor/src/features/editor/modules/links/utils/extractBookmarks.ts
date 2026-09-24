/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Bookmark Extractor Utility
 * Description:
 * Scans the editor DOM container to extract existing bookmarks,
 * calculating their containing page and associated anchor elements.
 * --------------------------------------------------------
 */

import type { BookmarkItem } from '../types';

export const extractBookmarksFromDom = (container: HTMLElement | null): BookmarkItem[] => {
  if (!container) return [];

  const elements = container.querySelectorAll<HTMLElement>('a[data-bookmark], [data-bookmark-id], a.bookmark-anchor');
  const bookmarks: BookmarkItem[] = [];
  const seenIds = new Set<string>();

  elements.forEach((el, index) => {
    const id = el.id || el.getAttribute('data-bookmark-id') || `bookmark_${index}`;
    if (seenIds.has(id)) return;
    seenIds.add(id);

    const name = el.getAttribute('data-bookmark') || el.getAttribute('title') || el.innerText || `Bookmark ${index + 1}`;
    const text = el.innerText || el.textContent || '';

    // Determine page number if nested inside a page container
    let pageNumber = 1;
    const pageEl = el.closest('[data-page-id], section[data-page-id]');
    if (pageEl) {
      const pageIndexAttr = pageEl.getAttribute('data-page-id');
      const allPages = container.querySelectorAll('[data-page-id]');
      allPages.forEach((p, idx) => {
        if (p === pageEl || p.getAttribute('data-page-id') === pageIndexAttr) {
          pageNumber = idx + 1;
        }
      });
    }

    bookmarks.push({
      id,
      name: name.trim(),
      text: text.trim(),
      pageNumber,
      createdAt: new Date().toISOString(),
      elementId: el.id || id,
    });
  });

  return bookmarks;
};
