/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: BookmarkList Component
 * Description:
 * Displays all active bookmarks with filter, destination navigation, and deletion.
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { Bookmark, Trash2, Search, ArrowUpRight } from 'lucide-react';
import type { BookmarkItem } from '../../types';

export interface BookmarkListProps {
  bookmarks: BookmarkItem[];
  onNavigate: (bookmark: BookmarkItem) => void;
  onDelete: (bookmark: BookmarkItem) => void;
}

export function BookmarkList({ bookmarks, onNavigate, onDelete }: BookmarkListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = bookmarks.filter((b) => {
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || (b.text && b.text.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-2.5">
      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter bookmarks..."
          className="h-7 w-full rounded-md border border-secondary bg-muted/70 pl-8 pr-3 text-xs outline-none dark:border-muted dark:bg-[#07131E] dark:text-muted-foreground focus:border-amber-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-secondary bg-muted/50 p-4 text-center dark:border-muted dark:bg-[#07131E]">
          <p className="text-xs text-muted-foreground">
            {bookmarks.length === 0 ? 'No bookmarks defined in document.' : 'No matching bookmarks.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
          {filtered.map((bm) => (
            <div
              key={bm.id}
              onClick={() => onNavigate(bm)}
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-secondary bg-card p-2 transition-all hover:border-amber-300 hover:bg-amber-50/20 dark:border-muted dark:bg-[#091524] dark:hover:border-amber-700/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <Bookmark className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-foreground dark:text-primary-foreground">
                      {bm.name}
                    </span>
                    {bm.pageNumber && (
                      <span className="rounded bg-muted px-1 py-[0.8px] text-[9px] font-medium text-muted-foreground dark:bg-muted dark:text-muted-foreground">
                        Page {bm.pageNumber}
                      </span>
                    )}
                  </div>
                  {bm.text && (
                    <p className="truncate text-[10px] text-muted-foreground">
                      "{bm.text}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(bm);
                  }}
                  title="Jump to bookmark"
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-950/50"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(bm);
                  }}
                  title="Delete bookmark"
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
