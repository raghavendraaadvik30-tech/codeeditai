/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Service: NavigationPagesService
 * Scans document pages, generates thumbnail preview data,
 * tracks active page, and manages page jumps.
 * --------------------------------------------------------
 */

import type { PageThumbnailItem } from '../types/navigation.types';

export class NavigationPagesService {
  /**
   * Scans and returns thumbnail information for all pages strictly avoiding duplicates.
   */
  public getPages(activePageId?: string, pageHtmlMap?: Record<string, string>): PageThumbnailItem[] {
    if (typeof document === 'undefined') return [];

    // Query strictly top-level page sections in the workspace
    const rawSections = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-page-id]')
    ).filter((el) => {
      return (
        !el.closest('aside') &&
        !el.closest('[role="dialog"]') &&
        !el.closest('header') &&
        !el.closest('nav')
      );
    });

    // Deduplicate strictly by data-page-id
    const seenPageIds = new Set<string>();
    const pageSections: HTMLElement[] = [];

    for (const sec of rawSections) {
      const pid = sec.getAttribute('data-page-id');
      if (pid && !seenPageIds.has(pid)) {
        seenPageIds.add(pid);
        pageSections.push(sec);
      }
    }

    return pageSections.map((el, index) => {
      const pageId = el.getAttribute('data-page-id') || `page_${index + 1}`;

      // Extract editor editable content (excluding headers & footers)
      const editorArea = el.querySelector<HTMLElement>('[data-editor-page][contenteditable="true"]') ||
        el.querySelector<HTMLElement>('[data-editor-page]') ||
        el;

      const rawText = (editorArea.innerText || editorArea.textContent || '').trim().replace(/\s+/g, ' ');
      const snippet = rawText.length > 120 ? `${rawText.substring(0, 117)}...` : rawText || 'Empty page';

      // Page HTML for thumbnail miniature preview
      const html = pageHtmlMap?.[pageId] || editorArea.innerHTML || '';

      // Determine page label / number from DOM badge or index
      const badgeEl = el.querySelector<HTMLElement>('.absolute.-left-12');
      const badgeText = badgeEl?.innerText?.trim();
      const pageLabel = badgeText && badgeText.length > 0 ? badgeText : `${index + 1}`;
      const parsedNum = parseInt(pageLabel, 10);
      const pageNumber = !isNaN(parsedNum) ? parsedNum : index + 1;

      return {
        pageNumber,
        pageLabel,
        pageId,
        snippet,
        html,
        element: el,
        isActive: activePageId ? activePageId === pageId : index === 0,
      };
    });
  }

  /**
   * Smoothly scrolls to the selected page and focuses its editor.
   */
  public navigateToPage(item: PageThumbnailItem): boolean {
    if (!item.element) return false;
    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const editable = item.element.querySelector<HTMLElement>('[contenteditable="true"]');
    if (editable) {
      try {
        editable.focus();
      } catch {
        // Ignore
      }
    }
    return true;
  }
}

export const navigationPagesService = new NavigationPagesService();
