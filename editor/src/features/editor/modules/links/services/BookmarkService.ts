/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Bookmark Service
 * Description:
 * Manages document bookmark creation, wrapping selected text in bookmark anchors,
 * unwrapping/deletion without text loss, smooth scrolling navigation, and visual flash highlights.
 * --------------------------------------------------------
 */

import type { BookmarkItem } from '../types';
import { extractBookmarksFromDom } from '../utils/extractBookmarks';
import { generateReferenceId } from '../utils/generateReferenceId';

export class BookmarkService {
  /**
   * Scans editor for all bookmarks and their locations.
   */
  listBookmarks(container: HTMLElement | null): BookmarkItem[] {
    return extractBookmarksFromDom(container);
  }

  /**
   * Creates a bookmark at the current cursor position or wraps selection.
   */
  createBookmark(
    editor: HTMLElement | null,
    bookmarkName: string
  ): BookmarkItem | null {
    if (!editor || !bookmarkName.trim()) return null;

    const trimmedName = bookmarkName.trim();
    const id = generateReferenceId('bookmark', trimmedName);

    editor.focus();
    const selection = window.getSelection();

    let bookmarkElement: HTMLElement;

    if (selection && selection.rangeCount > 0 && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      const range = selection.getRangeAt(0);

      const anchor = document.createElement('a');
      anchor.id = id;
      anchor.setAttribute('data-bookmark', trimmedName);
      anchor.setAttribute('data-bookmark-id', id);
      anchor.className = 'bookmark-anchor bg-amber-500/10 dark:bg-amber-400/20 border-b border-dashed border-amber-500 font-medium px-0.5 rounded transition-all duration-300';
      anchor.title = `Bookmark: ${trimmedName}`;

      if (!range.collapsed) {
        // Wrap selected text
        try {
          range.surroundContents(anchor);
        } catch {
          const fragment = range.extractContents();
          anchor.appendChild(fragment);
          range.insertNode(anchor);
        }
      } else {
        // Collapsed cursor - insert labeled tag
        anchor.innerHTML = `🔖 ${escapeHtml(trimmedName)}`;
        range.insertNode(anchor);
      }

      bookmarkElement = anchor;
    } else {
      // Fallback insertion at end of editor
      const anchor = document.createElement('a');
      anchor.id = id;
      anchor.setAttribute('data-bookmark', trimmedName);
      anchor.setAttribute('data-bookmark-id', id);
      anchor.className = 'bookmark-anchor bg-amber-500/10 dark:bg-amber-400/20 border-b border-dashed border-amber-500 font-medium px-0.5 rounded transition-all duration-300';
      anchor.title = `Bookmark: ${trimmedName}`;
      anchor.innerHTML = `🔖 ${escapeHtml(trimmedName)}`;
      editor.appendChild(anchor);
      bookmarkElement = anchor;
    }

    // Determine page number
    let pageNumber = 1;
    const pageEl = bookmarkElement.closest('[data-page-id], section[data-page-id]');
    if (pageEl) {
      const allPages = Array.from(document.querySelectorAll('[data-page-id]'));
      const pageIdx = allPages.indexOf(pageEl);
      if (pageIdx !== -1) {
        pageNumber = pageIdx + 1;
      }
    }

    // Dispatch input event to sync documentModel
    editor.dispatchEvent(new Event('input', { bubbles: true }));

    return {
      id,
      name: trimmedName,
      text: bookmarkElement.innerText.trim(),
      pageNumber,
      createdAt: new Date().toISOString(),
      elementId: id,
    };
  }

  /**
   * Deletes bookmark anchor without deleting the inner text.
   */
  deleteBookmark(container: HTMLElement | null, idOrName: string): boolean {
    if (!container) return false;

    // Search by ID or data-bookmark attribute
    const escaped = CSS.escape(idOrName);
    const target = container.querySelector<HTMLElement>(`#${escaped}, [data-bookmark="${escaped}"], [data-bookmark-id="${escaped}"]`);

    if (!target) return false;

    const parent = target.parentNode;
    if (!parent) return false;

    // Preserve children / text nodes
    while (target.firstChild) {
      parent.insertBefore(target.firstChild, target);
    }
    parent.removeChild(target);
    parent.normalize();

    container.dispatchEvent(new Event('input', { bubbles: true }));

    return true;
  }

  /**
   * Navigates to target bookmark, smoothly scrolls into view, and applies highlight flash effect.
   */
  navigateToBookmark(container: HTMLElement | null, idOrName: string): boolean {
    const root = container || (typeof document !== 'undefined' ? document.body : null);
    if (!root || !idOrName) return false;

    const escaped = CSS.escape(idOrName);
    const target =
      root.querySelector<HTMLElement>(`#${escaped}`) ||
      root.querySelector<HTMLElement>(`[data-bookmark="${escaped}"]`) ||
      root.querySelector<HTMLElement>(`[data-bookmark-id="${escaped}"]`) ||
      (typeof document !== 'undefined'
        ? document.querySelector<HTMLElement>(`#${escaped}`) ||
          document.querySelector<HTMLElement>(`[data-bookmark="${escaped}"]`) ||
          document.querySelector<HTMLElement>(`[data-bookmark-id="${escaped}"]`)
        : null);

    if (!target) return false;

    // Smoothly scroll into center view
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    // Apply temporary highlight flash effect
    this.applyFlashEffect(target);

    return true;
  }


  /**
   * Applies temporary glowing pulse effect to an element.
   */
  applyFlashEffect(element: HTMLElement, durationMs = 2500): void {
    const originalStyle = element.getAttribute('style') || '';

    element.style.transition = 'all 0.3s ease';
    element.style.backgroundColor = '#fef08a'; // Tailwind yellow-200
    element.style.color = '#854d0e';
    element.style.outline = '2px solid #eab308';
    element.style.borderRadius = '4px';
    element.style.boxShadow = '0 0 12px rgba(234, 179, 8, 0.6)';

    setTimeout(() => {
      element.style.transition = 'all 0.8s ease';
      element.style.backgroundColor = '';
      element.style.color = '';
      element.style.outline = '';
      element.style.boxShadow = '';
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }
    }, durationMs);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] ?? char;
  });
}

export const bookmarkService = new BookmarkService();
