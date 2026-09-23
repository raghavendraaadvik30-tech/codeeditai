/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: CrossReferenceList Component
 * Description:
 * Displays all existing cross-references present in the active document.
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { BookOpen, Search, ArrowUpRight } from 'lucide-react';
import type { CrossReferenceItem } from '../../types';
import { LinkBadge } from '../common/LinkBadge';

export interface CrossReferenceListProps {
  items: CrossReferenceItem[];
  onNavigate: (targetId: string) => void;
}

export function CrossReferenceList({ items, onNavigate }: CrossReferenceListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.targetType.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter cross-references..."
          className="h-7 w-full rounded-md border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs outline-none dark:border-slate-800 dark:bg-[#07131E] dark:text-slate-200 focus:border-purple-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-[#07131E]">
          <p className="text-xs text-slate-400">
            {items.length === 0 ? 'No cross-references created in document yet.' : 'No matching cross-references.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.targetId)}
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-2 transition-all hover:border-purple-300 hover:bg-purple-50/20 dark:border-slate-800 dark:bg-[#091524] dark:hover:border-purple-700/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                  <BookOpen className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                    <LinkBadge type="cross_ref" label={item.targetType} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                    <span>Target: #{item.targetId}</span>
                    {item.pageNumber && <span>· Page {item.pageNumber}</span>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(item.targetId);
                }}
                title="Jump to target"
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-950/50"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
