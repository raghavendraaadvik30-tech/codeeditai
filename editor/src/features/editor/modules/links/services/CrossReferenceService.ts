/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Cross Reference Service
 * Description:
 * Automatically detects elements created/formatted in the document (Headings,
 * Tables, Figures, Bookmarks, Numbered lists, Pages), assigns stable unique IDs,
 * inserts dynamic cross-references, and performs smooth navigation.
 * NO manual registration button for headings/tables/figures & NO hardcoded mock data!
 * --------------------------------------------------------
 */

import type {
  CrossReferenceTarget,
  CrossReferenceTargetItem,
  CrossReferenceItem,
} from '../types';
import { STORAGE_KEYS } from '../constants';
import { generateReferenceId } from '../utils/generateReferenceId';

export class CrossReferenceService {
  /**
   * Helper to query all editable page containers in the active document workspace.
   * Strictly ignores sidebar, overlay, headers, and UI chrome.
   */
  private getWorkspaceContainers(container: HTMLElement | null): HTMLElement[] {
    if (typeof document === 'undefined') return [];

    // Query all document page sections inside the workspace
    const pageSections = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-page-id], [data-page-id]')
    ).filter((el) => {
      return !el.closest('aside') && !el.closest('[role="dialog"]') && !el.closest('header') && !el.closest('nav');
    });

    if (pageSections.length > 0) {
      return pageSections;
    }

    // Fallback to editable document pages inside the workspace
    const editables = Array.from(
      document.querySelectorAll<HTMLElement>(
        'section[data-page-id] [contenteditable="true"], [data-page-id] [contenteditable="true"], [contenteditable="true"]'
      )
    ).filter((el) => {
      return !el.closest('aside') && !el.closest('[role="dialog"]') && !el.closest('header') && !el.closest('nav');
    });

    if (editables.length > 0) {
      return editables;
    }

    if (container && !container.closest('aside') && !container.closest('[role="dialog"]') && !container.closest('header')) {
      return [container];
    }

    return [];
  }

  /**
   * Automatically detects elements created in the document for the given target type.
   * Assigns a stable ID to each created element if it doesn't have one already.
   */
  getAutoDetectedTargets(
    container: HTMLElement | null,
    targetType: CrossReferenceTarget
  ): CrossReferenceTargetItem[] {
    if (typeof document === 'undefined') return [];

    const rootContainers = this.getWorkspaceContainers(container);
    const allPages = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-page-id], [data-page-id], [data-editor-page]')
    ).filter((el) => {
      if (el.closest('aside') || el.closest('[role="dialog"]') || el.closest('header') || el.closest('nav')) return false;
      return el.hasAttribute('data-editor-page') || el.hasAttribute('contenteditable') || el.querySelector('[contenteditable]') !== null;
    });

    const getPageNumber = (el: Element): number => {
      const pageEl = el.closest('section[data-page-id], [data-page-id], [data-editor-page]');
      if (pageEl) {
        const explicitIndex = pageEl.getAttribute('data-page-index');
        if (explicitIndex && !isNaN(parseInt(explicitIndex, 10))) {
          return parseInt(explicitIndex, 10) + 1;
        }
        const idx = allPages.indexOf(pageEl as HTMLElement);
        if (idx !== -1) return idx + 1;
      }
      return 1;
    };

    const ensureStableId = (el: HTMLElement, prefix: string, index: number): string => {
      if (el.id && el.id.trim()) {
        return el.id.trim();
      }
      const rawText = (el.innerText || el.getAttribute('alt') || el.getAttribute('data-bookmark') || prefix)
        .trim()
        .substring(0, 25)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const newId = `${prefix}_${index + 1}_${rawText}`;
      el.id = newId;
      return newId;
    };

    const targets: CrossReferenceTargetItem[] = [];
    const seenElements = new Set<HTMLElement>();
    const seenIds = new Set<string>();

    // 1. HEADINGS (h1-h6, [data-heading], [data-style*="heading"], "1. Introduction", "2. System Architecture", "Section 3", etc.)
    if (targetType === 'heading') {
      rootContainers.forEach((root) => {
        // Find explicitly tagged headings
        const explicitHeadings = Array.from(
          root.querySelectorAll<HTMLElement>(
            'h1, h2, h3, h4, h5, h6, [data-heading], [data-type="heading"], [data-style*="Heading"], [data-style*="heading"], [role="heading"], p.heading, p.h1, p.h2, p.h3'
          )
        );

        // Also find paragraphs or text elements matching heading formats like "1. Introduction", "2. System Architecture", "Section 3", etc.
        const allCandidates = Array.from(root.querySelectorAll<HTMLElement>('p, div, li, strong, b, h1, h2, h3, h4, h5, h6'));

        const matchedHeadingElements: { el: HTMLElement; title: string }[] = [];

        explicitHeadings.forEach((el) => {
          let text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
          if (text) {
            text = text.length > 55 ? text.substring(0, 52) + '...' : text;
            matchedHeadingElements.push({ el, title: text });
          }
        });

        allCandidates.forEach((el) => {
          if (explicitHeadings.includes(el)) return;
          // Avoid matching child if parent is already a paragraph we inspect, unless parent is container
          const rawText = (el.innerText || el.textContent || '').trim();
          if (!rawText || rawText.length > 200) return;

          // Check if text matches heading patterns:
          // Examples: "1. Introduction", "2. System Architecture", "Section 3", "Section 3: Methods", "Chapter 1", "1.1 Overview"
          const headingPattern = /^((\d+(\.\d+)*|[A-Z]\.|\bSection\s+\d+|\bChapter\s+\d+)\s*[.:-]?\s+[^\n]+|^Section\s+\d+|^Chapter\s+\d+)/i;
          if (headingPattern.test(rawText)) {
            // Ignore if this is actually a link (like an inserted cross reference)
            if (el.tagName === 'A' || el.closest('a')) return;
            // Check if element is a paragraph or top block or strong tag
            const isBlock = el.tagName === 'P' || el.tagName === 'DIV' || el.tagName === 'LI' || el.parentElement?.tagName === 'P';
            if (isBlock) {
              // Extract first line or concise title
              const firstLine = rawText.split('\n')[0].trim().replace(/\s+/g, ' ');
              const cleanTitle = firstLine.length > 55 ? `${firstLine.substring(0, 52)}...` : firstLine;
              matchedHeadingElements.push({ el, title: cleanTitle });
            }
          }
        });

        matchedHeadingElements.forEach(({ el, title }, idx) => {
          if (seenElements.has(el)) return;
          seenElements.add(el);

          const id = ensureStableId(el, 'hd', idx);
          if (seenIds.has(id)) return;
          seenIds.add(id);

          targets.push({
            id,
            type: 'heading',
            title,
            pageNumber: getPageNumber(el),
            element: el,
          });
        });
      });
    }

    // 2. TABLES (table, [data-table], "Table 1", "Table 2: Demographics", etc.)
    else if (targetType === 'table') {
      rootContainers.forEach((root) => {
        const tableElements = Array.from(
          root.querySelectorAll<HTMLElement>('table, [data-table], [data-type="table"], .table-container')
        );

        const tableTextCandidates = Array.from(root.querySelectorAll<HTMLElement>('p, div, figcaption, caption, h3, h4'));

        const matchedTableElements: { el: HTMLElement; title: string }[] = [];

        // 1. Process <table> elements
        tableElements.forEach((el, index) => {
          let caption =
            el.querySelector('caption')?.innerText?.trim() ||
            el.getAttribute('data-table') ||
            el.getAttribute('title') ||
            `Table ${index + 1}`;
          
          caption = caption.replace(/\s+/g, ' ');
          caption = caption.length > 55 ? `${caption.substring(0, 52)}...` : caption;
          matchedTableElements.push({ el, title: caption });
        });

        // 2. Process text containing "Table 1", "Table 2", etc.
        tableTextCandidates.forEach((el) => {
          if (tableElements.includes(el)) return;
          if (el.tagName === 'A' || el.closest('a')) return;
          const text = (el.innerText || '').trim();
          if (/^Table\s+\d+/i.test(text)) {
            const firstLine = text.split('\n')[0].trim().replace(/\s+/g, ' ');
            const cleanTitle = firstLine.length > 55 ? `${firstLine.substring(0, 52)}...` : firstLine;
            matchedTableElements.push({ el, title: cleanTitle });
          }
        });

        matchedTableElements.forEach(({ el, title }, index) => {
          if (seenElements.has(el)) return;
          seenElements.add(el);

          const id = ensureStableId(el, 'tbl', index);
          if (seenIds.has(id)) return;
          seenIds.add(id);

          targets.push({
            id,
            type: 'table',
            title,
            pageNumber: getPageNumber(el),
            element: el,
          });
        });
      });
    }

    // 3. FIGURES (figure, img, [data-figure], "Figure 1", "Figure 1: Workflow", "Fig 1", etc.)
    else if (targetType === 'figure') {
      rootContainers.forEach((root) => {
        const figureElements = Array.from(
          root.querySelectorAll<HTMLElement>('figure, img, [data-figure], [data-type="figure"], .figure')
        );

        const figureTextCandidates = Array.from(root.querySelectorAll<HTMLElement>('p, figcaption, div, h3, h4'));

        const matchedFigureElements: { el: HTMLElement; title: string }[] = [];

        // 1. Process <figure> / <img> elements
        figureElements.forEach((el, index) => {
          let caption =
            el.getAttribute('data-figure') ||
            el.getAttribute('alt') ||
            el.querySelector('figcaption')?.innerText?.trim() ||
            el.getAttribute('title') ||
            `Figure ${index + 1}`;
            
          caption = caption.replace(/\s+/g, ' ');
          caption = caption.length > 55 ? `${caption.substring(0, 52)}...` : caption;
          matchedFigureElements.push({ el, title: caption });
        });

        // 2. Process text containing "Figure 1", "Fig. 1", "Figure 2: ...", etc.
        figureTextCandidates.forEach((el) => {
          if (figureElements.includes(el)) return;
          if (el.tagName === 'A' || el.closest('a')) return;
          const text = (el.innerText || '').trim();
          if (/^(figure|fig\.?)\s+\d+/i.test(text)) {
            const firstLine = text.split('\n')[0].trim().replace(/\s+/g, ' ');
            const cleanTitle = firstLine.length > 55 ? `${firstLine.substring(0, 52)}...` : firstLine;
            matchedFigureElements.push({ el, title: cleanTitle });
          }
        });

        matchedFigureElements.forEach(({ el, title }, index) => {
          if (seenElements.has(el)) return;
          seenElements.add(el);

          const id = ensureStableId(el, 'fig', index);
          if (seenIds.has(id)) return;
          seenIds.add(id);

          targets.push({
            id,
            type: 'figure',
            title,
            pageNumber: getPageNumber(el),
            element: el,
          });
        });
      });
    }

    // 4. BOOKMARKS (a[data-bookmark], [data-bookmark-id], .bookmark-anchor, span[data-bookmark] + localStorage)
    else if (targetType === 'bookmark') {
      rootContainers.forEach((root) => {
        const domBookmarks = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[data-bookmark], [data-bookmark-id], [id^="bookmark_"], [id^="bm_"], .bookmark-anchor, span[data-bookmark]'
          )
        );

        domBookmarks.forEach((el, index) => {
          if (seenElements.has(el)) return;
          seenElements.add(el);

          const name =
            el.getAttribute('data-bookmark') ||
            el.innerText?.replace(/^🔖\s*/, '')?.trim() ||
            `Bookmark ${index + 1}`;

          const id = ensureStableId(el, 'bm', index);
          if (seenIds.has(id)) return;
          seenIds.add(id);

          targets.push({
            id,
            type: 'bookmark',
            title: name,
            pageNumber: getPageNumber(el),
            element: el,
          });
        });
      });

      // Merge with stored bookmarks from localStorage for persistence
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
          if (raw) {
            const saved = JSON.parse(raw) as Array<{ id: string; name: string; pageNumber?: number }>;
            saved.forEach((b) => {
              if (!seenIds.has(b.id) && !seenIds.has(b.name)) {
                seenIds.add(b.id);
                targets.push({
                  id: b.id,
                  type: 'bookmark',
                  title: b.name,
                  pageNumber: b.pageNumber || 1,
                });
              }
            });
          }
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    return targets;
  }

  /**
   * Lists all cross-reference links inserted in the document.
   */
  listCrossReferences(container: HTMLElement | null): CrossReferenceItem[] {
    const rootContainers = this.getWorkspaceContainers(container);
    if (rootContainers.length === 0) return [];

    const anchors: HTMLAnchorElement[] = [];
    const seenAnchors = new Set<HTMLAnchorElement>();

    rootContainers.forEach((root) => {
      const found = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[data-cross-ref], a.cross-reference-link'));
      found.forEach((a) => {
        if (!seenAnchors.has(a)) {
          seenAnchors.add(a);
          anchors.push(a);
        }
      });
    });

    const allPages = Array.from(
      document.querySelectorAll<HTMLElement>('[data-page-id], section[data-page-id], [data-editor-page]')
    ).filter((el) => {
      if (el.closest('aside') || el.closest('[role="dialog"]') || el.closest('header') || el.closest('nav')) return false;
      return el.hasAttribute('data-editor-page') || el.hasAttribute('contenteditable') || el.querySelector('[contenteditable]') !== null;
    });

    return anchors.map((anchor, index) => {
      const targetType = (anchor.getAttribute('data-cross-ref') as CrossReferenceTarget) || 'custom';
      const targetId = anchor.getAttribute('data-target-id') || anchor.getAttribute('href')?.replace(/^#/, '') || '';
      const label = anchor.innerText?.trim() || `Reference ${index + 1}`;

      let pageNumber = 1;
      const pageEl = anchor.closest('[data-page-id], section[data-page-id], [data-editor-page]');
      if (pageEl) {
        const explicitIndex = pageEl.getAttribute('data-page-index');
        if (explicitIndex && !isNaN(parseInt(explicitIndex, 10))) {
          pageNumber = parseInt(explicitIndex, 10) + 1;
        } else {
          const idx = allPages.indexOf(pageEl as HTMLElement);
          if (idx !== -1) pageNumber = idx + 1;
        }
      }

      return {
        id: anchor.id || `xref_${index + 1}`,
        targetId,
        targetType,
        label,
        targetText: anchor.getAttribute('title') || label,
        pageNumber,
      };
    });
  }

  /**
   * Inserts a cross-reference link pointing to target.id.
   * If text is selected in the active editor, replaces that text with the cross-reference link.
   */
  insertCrossReference(
    editor: HTMLElement | null,
    target: CrossReferenceTargetItem,
    customLabel?: string,
    includePageNumber = true
  ): boolean {
    const activeEditor =
      editor ||
      (typeof document !== 'undefined'
        ? (document.querySelector('[contenteditable="true"]:focus') as HTMLElement) ||
        (document.querySelector('[contenteditable="true"]') as HTMLElement)
        : null);

    if (!activeEditor || !target) return false;

    const pageText =
      includePageNumber && target.pageNumber && !target.title.includes(`Page ${target.pageNumber}`)
        ? ` (Page ${target.pageNumber})`
        : '';

    let label: string;
    if (customLabel && customLabel.trim()) {
      label = customLabel.trim();
      if (includePageNumber && target.pageNumber && !label.includes(`Page ${target.pageNumber}`)) {
        label = `${label}${pageText}`;
      }
    } else {
      label = `${target.title}${pageText}`;
    }

    const id = generateReferenceId('custom', 'xref');
    const href = `#${target.id}`;

    const anchorHtml = `<a id="${id}" href="${href}" data-cross-ref="${target.type}" data-target-id="${target.id}" class="cross-reference-link text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer" title="Jump to ${escapeHtml(
      target.title
    )}">${escapeHtml(label)}</a>`;

    try {
      activeEditor.focus();
      const sel = window.getSelection();

      if (sel && sel.rangeCount > 0 && activeEditor.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        if (!range.collapsed) {
          // Replace selection with cross-reference anchor
          range.deleteContents();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = anchorHtml;
          const newAnchor = tempDiv.firstChild;
          if (newAnchor) {
            range.insertNode(newAnchor);
            // Move cursor right after inserted link
            range.setStartAfter(newAnchor);
            range.setEndAfter(newAnchor);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } else {
          document.execCommand('insertHTML', false, anchorHtml);
        }
      } else {
        const p = activeEditor.querySelector('p') || activeEditor;
        p.insertAdjacentHTML('beforeend', ` ${anchorHtml} `);
      }

      activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    } catch (err) {
      console.error('[CrossReferenceService] Insert failed:', err);
      return false;
    }
  }

  /**
   * Deletes/removes a cross reference anchor tag from the document container.
   */
  deleteCrossReference(container: HTMLElement | null, referenceId: string): boolean {
    const rootContainers = this.getWorkspaceContainers(container);
    if (rootContainers.length === 0 || !referenceId) return false;

    for (const root of rootContainers) {
      const anchor =
        root.querySelector<HTMLAnchorElement>(`#${CSS.escape(referenceId)}`) ||
        root.querySelector<HTMLAnchorElement>(`a[data-target-id="${CSS.escape(referenceId)}"]`);

      if (anchor) {
        const parent = anchor.parentNode;
        if (parent) {
          const textNode = document.createTextNode(anchor.innerText);
          parent.replaceChild(textNode, anchor);
          const editor = root.closest('[contenteditable="true"]') || root;
          editor.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Navigates to a target element by its exact unique ID, scrolls smooth center, and applies flash highlight.
   * Performs smart fallback search matching captions/headings if exact ID is missing.
   */
  navigateToTarget(_container: HTMLElement | null, targetId: string): boolean {
    if (!targetId) return false;

    const cleanId = targetId.startsWith('#') ? targetId.substring(1) : targetId;
    let escaped: string;
    try {
      escaped = CSS.escape(cleanId);
    } catch {
      escaped = cleanId.replace(/[^a-zA-Z0-9_-]/g, '');
    }

    let targetEl: HTMLElement | null = null;

    if (escaped && typeof document !== 'undefined') {
      targetEl =
        document.querySelector<HTMLElement>(`#${escaped}`) ||
        document.querySelector<HTMLElement>(`[data-target-id="${escaped}"]`) ||
        document.querySelector<HTMLElement>(`[data-bookmark="${escaped}"]`) ||
        document.querySelector<HTMLElement>(`[data-bookmark-id="${escaped}"]`) ||
        document.querySelector<HTMLElement>(`[data-page-id="${escaped}"]`);
    }

    // Intelligent fallback matching by target text or caption if exact ID lookup fails
    if (!targetEl && typeof document !== 'undefined') {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          'h1, h2, h3, h4, h5, h6, table, figure, img, a[data-bookmark], [data-bookmark-id], ol > li, li, p, div, [data-page-id], section[data-page-id], [data-heading]'
        )
      );

      // Clean search token e.g. "figure_1_workflow" -> "figure 1", or "Figure 1" -> "figure 1"
      const lowerToken = cleanId.replace(/^hd_|^fig_|^tbl_|^bm_|^num_/, '').replace(/_/g, ' ').toLowerCase().trim();

      targetEl =
        candidates.find((el) => {
          const text = (
            el.innerText ||
            el.getAttribute('alt') ||
            el.getAttribute('data-bookmark') ||
            el.getAttribute('title') ||
            el.id ||
            ''
          ).toLowerCase().trim();

          if (!text) return false;
          return text.includes(lowerToken) || lowerToken.includes(text) || text.startsWith(lowerToken);
        }) || null;
    }

    if (!targetEl) {
      console.warn(`[CrossReferenceService] Target "${targetId}" not found in document.`);
      return false;
    }

    // Find the nearest scrollable ancestor
    let scrollParent: HTMLElement | null = targetEl.parentElement;
    while (scrollParent && scrollParent !== document.body) {
      const overflowY = window.getComputedStyle(scrollParent).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && scrollParent.scrollHeight > scrollParent.clientHeight) {
        break;
      }
      scrollParent = scrollParent.parentElement;
    }

    if (scrollParent && scrollParent !== document.body) {
      // Precise scroll calculation relative to the scroll parent
      const parentRect = scrollParent.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const scrollY = scrollParent.scrollTop + (targetRect.top - parentRect.top) - (parentRect.height / 2) + (targetRect.height / 2);
      scrollParent.scrollTo({ top: scrollY, behavior: 'smooth' });
    } else {
      // Fallback
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Flash ring / background highlight
    const originalTransition = targetEl.style.transition;
    const originalBg = targetEl.style.backgroundColor;
    const originalOutline = targetEl.style.outline;
    const originalBoxShadow = targetEl.style.boxShadow;

    targetEl.style.transition = 'all 0.3s ease';
    targetEl.style.backgroundColor = '#dbeafe';
    targetEl.style.outline = '2px solid #3b82f6';
    targetEl.style.borderRadius = '4px';
    targetEl.style.boxShadow = '0 0 16px rgba(59, 130, 246, 0.6)';

    setTimeout(() => {
      targetEl.style.transition = 'all 0.8s ease';
      targetEl.style.backgroundColor = originalBg;
      targetEl.style.outline = originalOutline;
      targetEl.style.boxShadow = originalBoxShadow;
      setTimeout(() => {
        targetEl.style.transition = originalTransition;
      }, 800);
    }, 2500);

    return true;
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

export const crossReferenceService = new CrossReferenceService();
