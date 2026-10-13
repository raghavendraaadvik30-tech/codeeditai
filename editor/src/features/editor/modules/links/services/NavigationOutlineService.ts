/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Service: NavigationOutlineService
 * Scans document headings, builds hierarchical outline tree (Heading 1-6),
 * handles collapse/expand, active heading tracking, and smooth navigation.
 * --------------------------------------------------------
 */

import type { HeadingNode } from '../types/navigation.types';

export interface FlatHeadingItem {
  id: string;
  title: string;
  level: number;
  pageNumber: number;
  element: HTMLElement;
  order: number;
}

export class NavigationOutlineService {
  /**
   * Helper to query document page containers, ignoring sidebars, overlays, dialogs.
   */
  public getWorkspaceContainers(container: HTMLElement | null): HTMLElement[] {
    if (typeof document === 'undefined') return [];

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

    const seen = new Set<string>();
    const pageSections: HTMLElement[] = [];
    for (const sec of rawSections) {
      const pid = sec.getAttribute('data-page-id');
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        pageSections.push(sec);
      }
    }

    if (pageSections.length > 0) return pageSections;

    const editables = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-page-id] [contenteditable="true"]')
    ).filter((el) => {
      return (
        !el.closest('aside') &&
        !el.closest('[role="dialog"]') &&
        !el.closest('header') &&
        !el.closest('nav')
      );
    });

    if (editables.length > 0) return editables;

    if (
      container &&
      !container.closest('aside') &&
      !container.closest('[role="dialog"]') &&
      !container.closest('header')
    ) {
      return [container];
    }

    return [];
  }

  /**
   * Calculates accurate page number for a given element.
   */
  public getPageNumber(el: Element): number {
    const rawSections = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-page-id]')
    ).filter((p) => {
      return !p.closest('aside') && !p.closest('[role="dialog"]') && !p.closest('header');
    });

    const seen = new Set<string>();
    const pageSections: HTMLElement[] = [];
    for (const sec of rawSections) {
      const pid = sec.getAttribute('data-page-id');
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        pageSections.push(sec);
      }
    }

    const pageSection = el.closest('section[data-page-id]');
    if (pageSection) {
      const badge = pageSection.querySelector<HTMLElement>('.absolute.-left-12');
      if (badge && badge.innerText) {
        const parsed = parseInt(badge.innerText.trim(), 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }

      const explicitIndex = pageSection.getAttribute('data-page-index');
      if (explicitIndex && !isNaN(parseInt(explicitIndex, 10))) {
        return parseInt(explicitIndex, 10) + 1;
      }
      const idx = pageSections.indexOf(pageSection as HTMLElement);
      if (idx !== -1) return idx + 1;
    }
    return 1;
  }

  /**
   * Determines heading level (1-6) based on HTML tag, style attribute, or numbering format.
   */
  public determineHeadingLevel(el: HTMLElement, text: string): number {
    const tag = el.tagName.toLowerCase();
    if (tag === 'h1') return 1;
    if (tag === 'h2') return 2;
    if (tag === 'h3') return 3;
    if (tag === 'h4') return 4;
    if (tag === 'h5') return 5;
    if (tag === 'h6') return 6;

    const styleAttr = (el.getAttribute('data-style') || el.className || '').toLowerCase();
    const styleMatch = styleAttr.match(/heading\s*(\d)/);
    if (styleMatch) {
      const parsed = parseInt(styleMatch[1], 10);
      if (parsed >= 1 && parsed <= 9) return parsed;
    }

    const trimmed = text.trim();

    // Check for "Chapter 1", "Chapter I", etc. -> Level 1
    if (/^chapter\s+([0-9ivxlcdm]+|[a-z]+)/i.test(trimmed)) {
      return 1;
    }

    // Numbered outline patterns:
    // e.g. "3.2.1" -> 3 segments -> level 3
    // "1.1" -> 2 segments -> level 2
    // "1" or "1." -> 1 segment -> level 1
    const dotNumberMatch = trimmed.match(/^(\d+(\.\d+)*)/);
    if (dotNumberMatch) {
      const dots = dotNumberMatch[1].split('.');
      return Math.min(6, Math.max(1, dots.length));
    }

    // "Section 1" -> Level 1
    if (/^section\s+\d+/i.test(trimmed)) {
      return 1;
    }

    return 1;
  }

  /**
   * Scans document and extracts flat heading items.
   */
  public extractFlatHeadings(container: HTMLElement | null): FlatHeadingItem[] {
    if (typeof document === 'undefined') return [];

    const roots = this.getWorkspaceContainers(container);
    if (roots.length === 0) return [];

    const items: FlatHeadingItem[] = [];
    const seenElements = new Set<HTMLElement>();
    let orderCounter = 0;

    roots.forEach((root) => {
      // 1. Explicit heading tags and styled elements
      const explicitCandidates = Array.from(
        root.querySelectorAll<HTMLElement>(
          'h1, h2, h3, h4, h5, h6, [data-heading], [data-type="heading"], [data-style*="Heading"], [data-style*="heading"], [role="heading"], p.heading, p.h1, p.h2, p.h3'
        )
      );

      // 2. Paragraph and block candidates matching numbering (e.g., "Chapter 1 Introduction", "1.1 Background", etc.)
      const textCandidates = Array.from(
        root.querySelectorAll<HTMLElement>('p, div, li')
      );

      const allCandidates: HTMLElement[] = [...explicitCandidates];
      textCandidates.forEach((el) => {
        if (!allCandidates.includes(el)) {
          allCandidates.push(el);
        }
      });

      allCandidates.forEach((el) => {
        if (seenElements.has(el)) return;
        if (el.closest('aside') || el.closest('[role="dialog"]') || el.closest('header')) return;

        // Skip if element is a link or inside a link
        if (el.tagName === 'A' || el.closest('a')) return;

        const rawText = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (!rawText || rawText.length > 250) return;

        const isExplicit =
          /^H[1-6]$/i.test(el.tagName) ||
          el.hasAttribute('data-heading') ||
          (el.getAttribute('data-style') || '').toLowerCase().includes('heading');

        const isNumbered =
          /^(chapter\s+[0-9ivxlcdm]+|\d+(\.\d+)*\s+[a-z]|section\s+\d+)/i.test(rawText);

        if (isExplicit || isNumbered) {
          // If a parent is already in items and is a heading block, don't duplicate child text
          const parentHeading = el.parentElement?.closest('h1, h2, h3, h4, h5, h6, [data-heading]');
          if (parentHeading && parentHeading !== el && seenElements.has(parentHeading as HTMLElement)) {
            return;
          }

          seenElements.add(el);

          // Ensure stable element id
          if (!el.id) {
            const clean = rawText
              .substring(0, 20)
              .replace(/[^a-zA-Z0-9]/g, '_')
              .toLowerCase();
            el.id = `nav_hd_${orderCounter + 1}_${clean}`;
          }

          const level = this.determineHeadingLevel(el, rawText);
          const pageNumber = this.getPageNumber(el);

          items.push({
            id: el.id,
            title: rawText,
            level,
            pageNumber,
            element: el,
            order: orderCounter++,
          });
        }
      });
    });

    return items;
  }

  /**
   * Builds hierarchical HeadingNode tree from flat headings list.
   */
  public buildHeadingTree(
    flatItems: FlatHeadingItem[],
    searchQuery?: string
  ): HeadingNode[] {
    const rootNodes: HeadingNode[] = [];
    const stack: HeadingNode[] = [];
    const query = searchQuery?.trim().toLowerCase() || '';

    flatItems.forEach((item) => {
      const hasMatch = Boolean(query && item.title.toLowerCase().includes(query));

      const node: HeadingNode = {
        id: item.id,
        title: item.title,
        level: item.level,
        pageNumber: item.pageNumber,
        element: item.element,
        children: [],
        hasMatch,
      };

      // Pop from stack until top of stack has a lower level (i.e. is a true parent)
      while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        rootNodes.push(node);
      } else {
        const parent = stack[stack.length - 1];
        node.parentId = parent.id;
        parent.children.push(node);
      }

      stack.push(node);
    });

    return rootNodes;
  }

  /**
   * Finds all heading IDs that should be expanded so matching headings are visible.
   */
  public getAncestorIdsForMatches(nodes: HeadingNode[]): Set<string> {
    const ancestorIds = new Set<string>();

    const checkNode = (node: HeadingNode): boolean => {
      let childHasMatch = false;
      for (const child of node.children) {
        if (checkNode(child)) {
          childHasMatch = true;
        }
      }

      if (node.hasMatch || childHasMatch) {
        if (node.parentId) {
          ancestorIds.add(node.parentId);
        }
        return true;
      }
      return false;
    };

    nodes.forEach(checkNode);
    return ancestorIds;
  }

  /**
   * Navigates smoothly to heading, selects it in the document, and applies highlight flash.
   */
  public navigateToHeading(node: HeadingNode): boolean {
    if (!node.element) return false;

    // Smooth scroll into view
    node.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus & place cursor
    try {
      node.element.focus?.();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node.element);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } catch {
      // Ignore if document selection is restricted
    }

    // Flash highlight
    const originalBg = node.element.style.backgroundColor;
    const originalTransition = node.element.style.transition;
    node.element.style.transition = 'background-color 0.4s ease';
    node.element.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';

    setTimeout(() => {
      node.element.style.backgroundColor = originalBg;
      setTimeout(() => {
        node.element.style.transition = originalTransition;
      }, 400);
    }, 1200);

    return true;
  }
}

export const navigationOutlineService = new NavigationOutlineService();
