/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Service: NavigationSearchService
 * Performs document full-text search, generates context snippets,
 * tracks match count, and provides smooth jump-to-match navigation.
 * --------------------------------------------------------
 */

import type { SearchMatchItem } from '../types/navigation.types';
import { navigationOutlineService } from './NavigationOutlineService';

export class NavigationSearchService {
  /**
   * Searches the entire document body for occurrences of `query`.
   */
  public search(
    container: HTMLElement | null,
    query: string
  ): SearchMatchItem[] {
    const trimmed = query.trim();
    if (!trimmed || typeof document === 'undefined') return [];

    const roots = navigationOutlineService.getWorkspaceContainers(container);
    if (roots.length === 0) return [];

    const matches: SearchMatchItem[] = [];
    const queryLower = trimmed.toLowerCase();
    let globalIndex = 0;

    roots.forEach((root) => {
      // Find all text-bearing block elements within this root
      const elements = Array.from(
        root.querySelectorAll<HTMLElement>(
          'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div[data-text]'
        )
      );

      elements.forEach((el) => {
        if (el.closest('aside') || el.closest('[role="dialog"]') || el.closest('header')) return;

        // Skip container divs that contain other matched paragraphs
        if (el.tagName === 'DIV' && el.querySelector('p, h1, h2, h3, h4, h5, h6, li')) {
          return;
        }

        const text = el.innerText || el.textContent || '';
        if (!text) return;

        const textLower = text.toLowerCase();
        let startIndex = 0;

        while (startIndex < textLower.length) {
          const foundPos = textLower.indexOf(queryLower, startIndex);
          if (foundPos === -1) break;

          const matchText = text.substring(foundPos, foundPos + trimmed.length);

          // Calculate surrounding snippet
          const preStart = Math.max(0, foundPos - 35);
          const snippetPre = (preStart > 0 ? '...' : '') + text.substring(preStart, foundPos);

          const postEnd = Math.min(text.length, foundPos + trimmed.length + 45);
          const snippetPost =
            text.substring(foundPos + trimmed.length, postEnd) +
            (postEnd < text.length ? '...' : '');

          const pageNumber = navigationOutlineService.getPageNumber(el);

          matches.push({
            id: `match_${globalIndex}_${pageNumber}`,
            matchText,
            snippetPre,
            snippetMatch: matchText,
            snippetPost,
            pageNumber,
            element: el,
            index: globalIndex,
          });

          globalIndex++;
          startIndex = foundPos + Math.max(1, trimmed.length);
        }
      });
    });

    return matches;
  }

  /**
   * Smoothly scrolls to the matched element and applies temporary highlight.
   */
  public navigateToMatch(match: SearchMatchItem): boolean {
    if (!match.element) return false;

    match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus & pulse highlight
    try {
      match.element.focus?.();
    } catch {
      // Ignore
    }

    const el = match.element;
    const originalBg = el.style.backgroundColor;
    const originalTransition = el.style.transition;
    el.style.transition = 'background-color 0.4s ease';
    el.style.backgroundColor = 'rgba(250, 204, 21, 0.45)';

    setTimeout(() => {
      el.style.backgroundColor = originalBg;
      setTimeout(() => {
        el.style.transition = originalTransition;
      }, 400);
    }, 1400);

    return true;
  }
}

export const navigationSearchService = new NavigationSearchService();
