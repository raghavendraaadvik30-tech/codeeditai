/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Service: wordSearch.ts
 * Implements Word Navigation Pane search behavior:
 * - Office.js Word API search when in Word environment (context.document.body.search)
 * - Seamless DOM fallback for browser editor (tables, headings, paragraphs, lists)
 * - buildSnippet with ~60 char radius, handling start/middle/end/long paragraphs
 * - Stale search cancellation with request counter
 * - Batching loads and calling context.sync() once
 * - goToResult, next, previous with wrap-around, and clear
 * --------------------------------------------------------
 */

import { useNavigationStore } from '../store/navigationStore';
import type { SearchResultItem, SearchOptions } from '../types/navigation.types';
import { navigationOutlineService } from './NavigationOutlineService';

// Declaration for optional Office.js global Word object
declare const Word: any;

export interface SnippetResult {
  snippetPre: string;
  snippetMatch: string;
  snippetPost: string;
}

export class WordSearchService {
  /**
   * Builds a context snippet around the match of ~60 characters on either side.
   * Handles start of text, middle, end, and very long paragraphs cleanly.
   */
  public buildSnippet(
    fullText: string,
    matchIndex: number,
    matchLength: number,
    contextRadius: number = 60
  ): SnippetResult {
    if (!fullText) {
      return { snippetPre: '', snippetMatch: '', snippetPost: '' };
    }

    // Normalize excess whitespace and newlines for clean display
    const rawClean = fullText.replace(/[\r\n\t]+/g, ' ');
    const safeIndex = Math.max(0, Math.min(matchIndex, rawClean.length));
    const safeLength = Math.max(0, Math.min(matchLength, rawClean.length - safeIndex));

    const matchText = rawClean.substring(safeIndex, safeIndex + safeLength);

    // Left snippet (before match)
    let snippetPre = '';
    if (safeIndex > 0) {
      const startPos = Math.max(0, safeIndex - contextRadius);
      const preSlice = rawClean.substring(startPos, safeIndex);
      snippetPre = (startPos > 0 ? '...' : '') + preSlice;
    }

    // Right snippet (after match)
    let snippetPost = '';
    const endPos = safeIndex + safeLength;
    if (endPos < rawClean.length) {
      const postLimit = Math.min(rawClean.length, endPos + contextRadius);
      const postSlice = rawClean.substring(endPos, postLimit);
      snippetPost = postSlice + (postLimit < rawClean.length ? '...' : '');
    }

    return {
      snippetPre,
      snippetMatch: matchText,
      snippetPost,
    };
  }

  /**
   * Executes search with request counter to cancel stale older searches.
   * Dispatches to Word API if available, or high-performance DOM search.
   */
  public async search(
    query: string,
    options?: Partial<SearchOptions>,
    container?: HTMLElement | null
  ): Promise<SearchResultItem[]> {
    const store = useNavigationStore.getState();
    const currentRequestId = store.incrementRequestId();

    const trimmed = query.trim();
    if (!trimmed) {
      store.clear();
      return [];
    }

    const effectiveOptions: SearchOptions = {
      matchCase: options?.matchCase ?? store.options.matchCase,
      matchWholeWord: options?.matchWholeWord ?? store.options.matchWholeWord,
    };

    store.setStatus('searching');

    try {
      // 1. Office.js Word Environment (if running inside Microsoft Word Add-in)
      if (typeof Word !== 'undefined' && typeof Word.run === 'function') {
        const results = await this.searchWordApi(trimmed, effectiveOptions, currentRequestId);
        return results;
      }

      // 2. Browser DOM Editor Environment (Vite standalone workspace)
      const results = await this.searchDom(trimmed, effectiveOptions, currentRequestId, container);
      return results;
    } catch (err: any) {
      if (store.requestId === currentRequestId) {
        store.setStatus('error', err?.message || 'An error occurred while searching.');
      }
      return [];
    }
  }

  /**
   * Word API implementation using context.document.body.search
   */
  private async searchWordApi(
    query: string,
    options: SearchOptions,
    requestId: number
  ): Promise<SearchResultItem[]> {
    const store = useNavigationStore.getState();

    return await Word.run(async (context: any) => {
      const searchOptions = {
        matchCase: options.matchCase,
        matchWholeWord: options.matchWholeWord,
      };

      const searchResults = context.document.body.search(query, searchOptions);
      searchResults.load('items');
      await context.sync();

      // If a newer search was triggered while awaiting sync, drop stale result
      if (useNavigationStore.getState().requestId !== requestId) {
        return [];
      }

      const totalMatches = searchResults.items.length;
      const itemsToLoad = searchResults.items.slice(0, 500);

      // Batch all paragraphs and text loads in ONE pass
      const paras: any[] = [];
      for (const item of itemsToLoad) {
        item.load('text');
        const para = item.paragraphs.getFirst();
        para.load('text');
        paras.push(para);
      }

      // Single batched sync (NEVER in a loop)
      await context.sync();

      if (useNavigationStore.getState().requestId !== requestId) {
        return [];
      }

      const results: SearchResultItem[] = [];

      for (let i = 0; i < itemsToLoad.length; i++) {
        const item = itemsToLoad[i];
        const para = paras[i];
        const paraText = para?.text || item.text || '';
        const itemText = item.text || query;

        const matchIdx = paraText.indexOf(itemText);
        const snippet = this.buildSnippet(
          paraText,
          matchIdx >= 0 ? matchIdx : 0,
          itemText.length,
          60
        );

        results.push({
          id: `word_result_${i}`,
          matchText: itemText,
          snippetPre: snippet.snippetPre,
          snippetMatch: snippet.snippetMatch,
          snippetPost: snippet.snippetPost,
          pageNumber: 1, // WordApiDesktop pages if supported
          pageLabel: '1',
          range: item,
          index: i,
        });
      }

      store.setResults(results, totalMatches);
      return results;
    });
  }

  /**
   * DOM implementation for the standalone editor workspace.
   * Covers whole document body, including tables (td, th), headings, lists, paragraphs.
   */
  private async searchDom(
    query: string,
    options: SearchOptions,
    requestId: number,
    container?: HTMLElement | null
  ): Promise<SearchResultItem[]> {
    const store = useNavigationStore.getState();
    const roots = navigationOutlineService.getWorkspaceContainers(container || null);

    if (roots.length === 0) {
      if (store.requestId === requestId) {
        store.setResults([], 0);
      }
      return [];
    }

    const results: SearchResultItem[] = [];
    let globalIndex = 0;
    const maxResults = 500;
    let totalCount = 0;

    // Build regex based on options
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regexPattern = escapedQuery;
    if (options.matchWholeWord) {
      regexPattern = `\\b${escapedQuery}\\b`;
    }
    const regexFlags = options.matchCase ? 'g' : 'gi';
    const regex = new RegExp(regexPattern, regexFlags);

    for (const root of roots) {
      // Find all text-bearing elements within this page/root (tables, paragraphs, headings, lists)
      const elements = Array.from(
        root.querySelectorAll<HTMLElement>(
          'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote'
        )
      ).filter((el) => {
        return !el.closest('aside') && !el.closest('[role="dialog"]') && !el.closest('header');
      });

      for (const el of elements) {
        // Skip parent block if it contains nested paragraphs already covered
        if (el.tagName === 'DIV' && el.querySelector('p, h1, h2, h3, h4, h5, h6, li, td, th')) {
          continue;
        }

        const rawText = el.innerText || el.textContent || '';
        if (!rawText) continue;

        regex.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(rawText)) !== null) {
          totalCount++;

          if (results.length < maxResults) {
            const matchIndex = match.index;
            const matchText = match[0];
            const snippet = this.buildSnippet(rawText, matchIndex, matchText.length, 60);
            const pageNum = navigationOutlineService.getPageNumber(el);

            results.push({
              id: `match_${globalIndex}_p${pageNum}`,
              matchText,
              snippetPre: snippet.snippetPre,
              snippetMatch: snippet.snippetMatch,
              snippetPost: snippet.snippetPost,
              pageNumber: pageNum,
              pageLabel: String(pageNum),
              element: el,
              index: globalIndex,
            });

            globalIndex++;
          }

          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      }
    }

    // Cancel if a newer request arrived
    if (store.requestId !== requestId) {
      return [];
    }

    store.setResults(results, totalCount);
    return results;
  }

  /**
   * Navigates to a specific search result, highlights it, and selects range in document.
   */
  public async goToResult(result: SearchResultItem, index?: number): Promise<boolean> {
    const store = useNavigationStore.getState();
    const effectiveIndex = index !== undefined ? index : result.index;
    store.setCurrentIndex(effectiveIndex);

    // 1. Word API Range Selection
    if (result.range && typeof Word !== 'undefined' && typeof Word.run === 'function') {
      try {
        await Word.run(async (context: any) => {
          result.range.select();
          await context.sync();
        });
        return true;
      } catch {
        // Fallback to DOM
      }
    }

    // 2. Standalone DOM Selection & Scroll
    if (!result.element) return false;

    // Smooth scroll document to element
    result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Native text range selection
    try {
      const sel = window.getSelection();
      if (sel) {
        const textNode = this.findTextNodeContaining(result.element, result.matchText);
        if (textNode) {
          const content = textNode.textContent || '';
          const idx = content.toLowerCase().indexOf(result.matchText.toLowerCase());
          if (idx !== -1) {
            const range = document.createRange();
            range.setStart(textNode, idx);
            range.setEnd(textNode, idx + result.matchText.length);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    } catch {
      // Ignore selection errors
    }

    // Temporary pulse highlight without altering document formatting permanently
    const el = result.element;
    const prevTransition = el.style.transition;
    const prevBg = el.style.backgroundColor;

    el.style.transition = 'background-color 0.3s ease';
    el.style.backgroundColor = 'rgba(191, 219, 254, 0.6)'; // light blue match highlight

    setTimeout(() => {
      el.style.backgroundColor = prevBg;
      setTimeout(() => {
        el.style.transition = prevTransition;
      }, 300);
    }, 1200);

    return true;
  }

  /**
   * Navigates to next result with wrap-around.
   */
  public async next(): Promise<number> {
    const store = useNavigationStore.getState();
    if (store.results.length === 0) return -1;
    const nextIdx = store.next();
    const result = store.results[nextIdx];
    if (result) {
      await this.goToResult(result, nextIdx);
    }
    return nextIdx;
  }

  /**
   * Navigates to previous result with wrap-around.
   */
  public async previous(): Promise<number> {
    const store = useNavigationStore.getState();
    if (store.results.length === 0) return -1;
    const prevIdx = store.previous();
    const result = store.results[prevIdx];
    if (result) {
      await this.goToResult(result, prevIdx);
    }
    return prevIdx;
  }

  /**
   * Clears query, results, and document selection without leaving any mark behind.
   */
  public clear(): void {
    const store = useNavigationStore.getState();
    store.clear();

    if (typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        sel.removeAllRanges();
      }
    }
  }

  /**
   * Helper to locate text node containing query.
   */
  private findTextNodeContaining(root: Node, text: string): Text | null {
    const target = text.toLowerCase();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.toLowerCase().includes(target)) {
        return node as Text;
      }
    }
    return null;
  }
}

export const wordSearchService = new WordSearchService();
