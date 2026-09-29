/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Links History Section
 * Description:
 * Persistent log table displaying all inserted links and references
 * with direct Open / Jump navigation and Delete actions.
 * --------------------------------------------------------
 */

import {
  History,
  Globe,
  Mail,
  FileText,
  BookOpen,
  Bookmark as BookmarkIcon,
  Plus,
  Trash2,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';
import type { LinkHistoryItem, LinkHistoryType } from '../../types';
import { cn } from '@/lib/utils';

interface LinksHistorySectionProps {
  history: LinkHistoryItem[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onExecuteAction: (item: LinkHistoryItem) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
}

export function LinksHistorySection({
  history,
  isRefreshing = false,
  onRefresh,
  onExecuteAction,
  onRemoveItem,
  onClearHistory,
}: LinksHistorySectionProps) {
  const getTypeBadge = (type: LinkHistoryType) => {

    switch (type) {
      case 'Web URL':
        return {
          icon: Globe,
          bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        };
      case 'Email':
        return {
          icon: Mail,
          bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'Document':
        return {
          icon: FileText,
          bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
      case 'Cross Reference':
        return {
          icon: BookOpen,
          bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'Bookmark':
        return {
          icon: BookmarkIcon,
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      default:
        return {
          icon: Globe,
          bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0B1520] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
      {/* Section Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#111D29]/70">
        <div className="flex items-center gap-2">
          <History className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            LINKS HISTORY
          </h3>
          <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[9px] font-bold text-slate-700 dark:text-slate-300">
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh history (sync with active document links and remove deleted links)"
              className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition cursor-pointer"
            >
              <RefreshCw className={cn("h-3 w-3 shrink-0", isRefreshing && "animate-spin")} />
              <span>Refresh</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[10px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-medium transition cursor-pointer"
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* History Items Table/List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {history.length === 0 ? (
          <div className="py-4 px-3 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No links or references recorded in history yet.
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Insert a Web URL, Email, Document reference, or Cross Reference to view history here.
            </p>
          </div>
        ) : (
          history.map((item) => {
            const badge = getTypeBadge(item.type);
            const Icon = badge.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
              >
                {/* Left metadata */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                  <div
                    className={cn(
                      'flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shrink-0',
                      badge.bg
                    )}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="truncate max-w-[90px]">{item.type}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.displayText}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 truncate">
                      <span className="truncate max-w-[200px]" title={item.target}>
                        {item.target}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(item.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 shrink-0 text-slate-500 dark:text-slate-400">
                        <User className="h-2.5 w-2.5" />
                        {item.createdBy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onExecuteAction(item)}
                    className="px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/80 text-[11px] font-semibold flex items-center gap-1 transition shadow-2xs"
                    title="Insert link into document sheet"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Insert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                    title="Remove from history"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
