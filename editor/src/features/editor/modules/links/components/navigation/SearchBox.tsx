/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Component: SearchBox
 * Microsoft Word style "Search Document" box with:
 * - Magnifier icon on the left
 * - Clear (x) button on the right (visible only when query > 0)
 * - Subtle loading indicator when status === 'searching'
 * - Match case and Whole word toggles
 * - Debounce 300 ms automatic search trigger
 * - Enter / ArrowDown for next match, Shift+Enter / ArrowUp for prev match
 * - Keyboard accessible with aria labels
 * --------------------------------------------------------
 */

import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigationStore } from '../../store/navigationStore';
import { wordSearchService } from '../../services/wordSearch';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  onSearchComplete?: () => void;
  className?: string;
}

export function SearchBox({ onSearchComplete, className }: SearchBoxProps) {
  const { query, setQuery, status, results } = useNavigationStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Trigger search with 300ms debounce
  const triggerDebouncedSearch = (newQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!newQuery.trim()) {
      wordSearchService.clear();
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      await wordSearchService.search(newQuery);
      onSearchComplete?.();
    }, 300);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    triggerDebouncedSearch(val);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    wordSearchService.clear();
    inputRef.current?.focus();
    onSearchComplete?.();
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    // Escape clears search
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
      return;
    }

    // If matches exist, Enter & ArrowDown = next, Shift+Enter & ArrowUp = previous
    if (results.length > 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          await wordSearchService.previous();
        } else {
          await wordSearchService.next();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        await wordSearchService.next();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        await wordSearchService.previous();
        return;
      }
    } else if (e.key === 'Enter') {
      // Immediate search on Enter
      e.preventDefault();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (query.trim()) {
        await wordSearchService.search(query);
        onSearchComplete?.();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className={cn('flex flex-col w-full space-y-1.5', className)}>
      <div className="relative flex items-center w-full">
        {/* Left Magnifier Icon or Loading Spinner */}
        <div className="absolute left-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          {status === 'searching' ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search Document"
          aria-label="Search Document"
          className="w-full h-8.5 pl-8 pr-8 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200 transition shadow-xs"
        />

        {/* Right Action Icons: Clear (x) Button */}
        {query.length > 0 && (
          <div className="absolute right-1.5 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear search"
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
