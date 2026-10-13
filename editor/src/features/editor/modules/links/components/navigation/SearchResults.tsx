/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Component: SearchResults
 * Replicates Microsoft Word Navigation Pane "Results" view:
 * - "Search Results (N)" collapsible header with magnifier icon & total count
 * - Rows: Match text snippet on the left (matching keyword in bold, ellipsis on long text),
 *   right-aligned "Page N" in gray.
 * - Current match = full-width light blue highlight, kept scrolled into view.
 * - Empty state: "Type in the search box to find text".
 * - No results state: "No results for 'xyz'".
 * - Searching state: small loading indicator.
 * - Screen-reader aria-live announcements & accessible keyboard navigation.
 * --------------------------------------------------------
 */

import { useEffect, useRef, type MouseEvent } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useNavigationStore } from '../../store/navigationStore';
import { wordSearchService } from '../../services/wordSearch';
import type { SearchResultItem } from '../../types/navigation.types';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  onSelectMatch?: (match: SearchResultItem, index: number) => void;
  className?: string;
}

export function SearchResults({ onSelectMatch, className }: SearchResultsProps) {
  const {
    query,
    results,
    currentIndex,
    status,
    errorMessage,
    totalCount,
    isCollapsed,
    toggleCollapsed,
  } = useNavigationStore();

  const activeRowRef = useRef<HTMLButtonElement | null>(null);

  // Keep current active row scrolled into view
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  const handleRowClick = async (item: SearchResultItem, index: number) => {
    await wordSearchService.goToResult(item, index);
    onSelectMatch?.(item, index);
  };

  const handlePrev = async (e: MouseEvent) => {
    e.stopPropagation();
    await wordSearchService.previous();
  };

  const handleNext = async (e: MouseEvent) => {
    e.stopPropagation();
    await wordSearchService.next();
  };

  // 1. Before any search has been typed
  if (!query.trim()) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500', className)}>
        <Search className="h-8 w-8 mb-2.5 opacity-40 stroke-[1.5]" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Type in the search box to find text
        </p>
        <p className="text-[11px] mt-1 max-w-[210px] leading-relaxed text-slate-500 dark:text-slate-400">
          Search anywhere across headings, paragraphs, lists, and tables.
        </p>
      </div>
    );
  }

  // 2. Searching state
  if (status === 'searching' && results.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500', className)}>
        <Loader2 className="h-7 w-7 mb-2 animate-spin text-[#2563EB]" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Searching document...
        </p>
      </div>
    );
  }

  // 3. Error state
  if (status === 'error') {
    return (
      <div className={cn('flex flex-col items-center justify-center p-5 text-center text-red-500', className)}>
        <AlertCircle className="h-6 w-6 mb-2 text-red-500" />
        <p className="text-xs font-semibold">Search encountered an issue</p>
        <p className="text-[11px] mt-1 text-slate-500 max-w-[220px]">
          {errorMessage || 'Unable to scan document. Please try again.'}
        </p>
      </div>
    );
  }

  // 4. No matches found
  if (results.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500', className)}>
        <Search className="h-8 w-8 mb-2 opacity-40 stroke-[1.5]" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          No results for "{query}"
        </p>
        <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
          Check your spelling or try different keywords.
        </p>
      </div>
    );
  }

  const formattedCount = totalCount > 500 ? '500+' : `${totalCount}`;

  return (
    <div className={cn('flex flex-col w-full py-1 space-y-1.5 select-none', className)}>
      {/* Screen Reader Aria-Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {totalCount} results found for {query}
      </div>

      {/* SECTION HEADER: "Search Results (N)" with Magnifier, total count, and collapse chevron */}
      <div
        onClick={toggleCollapsed}
        className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-[#111D29] border border-slate-200/80 dark:border-[#294564] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Search className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            Search Results ({formattedCount})
          </span>
          {status === 'searching' && (
            <Loader2 className="h-3 w-3 animate-spin text-[#2563EB] shrink-0 ml-1" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Quick prev / next buttons */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous result"
            title="Previous result (Shift+Enter or ArrowUp)"
            className="p-0.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 cursor-pointer transition"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next result"
            title="Next result (Enter or ArrowDown)"
            className="p-0.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 cursor-pointer transition"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {/* Collapse Chevron */}
          <button
            type="button"
            aria-label={isCollapsed ? 'Expand results' : 'Collapse results'}
            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-0.5 cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* RESULTS LIST */}
      {!isCollapsed && (
        <div
          role="listbox"
          aria-label="Search results list"
          className="flex flex-col space-y-1 w-full max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5"
        >
          {results.map((item, idx) => {
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={item.id || idx}
                ref={isCurrent ? activeRowRef : null}
                type="button"
                role="option"
                aria-selected={isCurrent}
                onClick={() => handleRowClick(item, idx)}
                className={cn(
                  'group flex items-start justify-between w-full p-2 rounded-lg text-left transition-all duration-150 cursor-pointer select-none text-xs border',
                  isCurrent
                    ? 'bg-[#EFF6FF] border-l-4 border-l-[#2563EB] border-slate-200 text-[#1E40AF] dark:bg-[#1E3A8A]/40 dark:border-l-[#3B82F6] dark:border-[#294564] dark:text-[#93C5FD] shadow-xs'
                    : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-transparent dark:hover:border-[#294564] dark:hover:bg-slate-800/40 dark:text-slate-300'
                )}
              >
                {/* Left: Snippet with bold match keyword */}
                <div className="flex-1 min-w-0 pr-2 line-clamp-2 leading-relaxed break-words">
                  {item.snippetPre && (
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.snippetPre}
                    </span>
                  )}
                  <strong className="font-bold text-slate-900 dark:text-white underline decoration-yellow-400 decoration-2">
                    {item.snippetMatch}
                  </strong>
                  {item.snippetPost && (
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.snippetPost}
                    </span>
                  )}
                </div>

                {/* Right: "Page N" in gray text */}
                <div className="shrink-0 text-[11px] font-medium text-slate-400 dark:text-slate-500 pt-0.5 select-none">
                  Page {item.pageLabel || item.pageNumber}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
