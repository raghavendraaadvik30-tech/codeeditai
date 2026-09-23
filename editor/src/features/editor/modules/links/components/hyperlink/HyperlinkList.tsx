/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: HyperlinkList Component
 * Description:
 * Lists all active hyperlinks detected across document pages,
 * with search filtering, destination jump navigation, and removal.
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { Search, Globe, Trash2, ExternalLink } from 'lucide-react';
import type { LinkModel } from '../../types';
import { LinkBadge } from '../common/LinkBadge';

export interface HyperlinkListProps {
  links: LinkModel[];
  onNavigate?: (link: LinkModel) => void;
  onRemove?: (link: LinkModel) => void;
}

export function HyperlinkList({ links, onNavigate, onRemove }: HyperlinkListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = links.filter((l) => {
    const q = searchQuery.toLowerCase();
    return l.displayText.toLowerCase().includes(q) || l.target.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-2.5">
      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter hyperlinks..."
          className="h-7 w-full rounded-md border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs outline-none dark:border-slate-800 dark:bg-[#07131E] dark:text-slate-200 focus:border-[#0078d4]"
        />
      </div>

      {/* Link Cards List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-[#07131E]">
          <p className="text-xs text-slate-400">
            {links.length === 0 ? 'No hyperlinks inserted yet.' : 'No matching links found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
          {filtered.map((link) => (
            <div
              key={link.id}
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 transition-all hover:border-blue-300 dark:border-slate-800 dark:bg-[#091524] dark:hover:border-slate-700"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {link.displayText || link.target}
                    </span>
                    <LinkBadge type={link.type} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                    <span className="truncate">{link.target}</span>
                    {link.pageNumber && <span>· Page {link.pageNumber}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {link.type === 'external' ? (
                  <a
                    href={link.target}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in new tab"
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate(link)}
                      title="Jump to reference"
                      className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-[#0078d4] dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )
                )}

                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(link)}
                    title="Remove hyperlink"
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
