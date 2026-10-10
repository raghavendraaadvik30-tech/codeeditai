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
          bg: 'bg-success-50 text-success-700 dark:bg-success-950/60 dark:text-success-300 border-success-200 dark:border-success-800',
        };
      case 'Document':
        return {
          icon: FileText,
          bg: 'bg-primary/10 text-primary/90 dark:bg-navy-950/60 dark:text-navy-300 border-primary/30 dark:border-primary',
        };
      case 'Cross Reference':
        return {
          icon: BookOpen,
          bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'Bookmark':
        return {
          icon: BookmarkIcon,
          bg: 'bg-warning-50 text-warning-700 dark:bg-warning-950/60 dark:text-warning-300 border-warning-200 dark:border-warning-800',
        };
      default:
        return {
          icon: Globe,
          bg: 'bg-muted text-secondary-foreground dark:bg-muted dark:text-muted-foreground border-secondary dark:border-secondary-foreground',
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
    <div className="flex flex-col bg-white dark:bg-[#111D29] border border-slate-200 dark:border-[#294564] rounded-2xl shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="shrink-0 flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-[#294564] bg-white dark:bg-[#111D29]">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            LINKS HISTORY
          </h3>
          <span className="rounded-full bg-[#EAF1FB] dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-[#1E3A5F] dark:text-slate-300">
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh history"
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 shrink-0", isRefreshing && "animate-spin text-[#2563EB]")} />
              <span>Refresh</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-destructive dark:hover:text-destructive font-medium transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* History Items Table/List */}
      <div className="divide-y divide-slate-100 dark:divide-[#294564]">
        {history.length === 0 ? (
          <div className="min-h-[140px] flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              No links or references recorded in history yet.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 max-w-[260px] leading-relaxed">
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
                className="flex items-center justify-between px-2 py-1 text-[10px] hover:bg-muted/80 dark:hover:bg-muted/40 transition group"
              >
                {/* Left metadata */}
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <div
                    className={cn(
                      'flex items-center gap-1 px-1 py-[1px] rounded border text-[8.5px] font-bold shrink-0',
                      badge.bg
                    )}
                  >
                    <Icon className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate max-w-22.5">{item.type}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-foreground dark:text-muted-foreground truncate">
                      {item.displayText}
                    </p>
                    <div className="flex items-center gap-1.5 text-9px text-muted-foreground mt-0.5 truncate">
                      <span className="truncate max-w-50" title={item.target}>
                        {item.target}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="h-2 w-2" />
                        {formatTime(item.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 shrink-0 text-muted-foreground dark:text-muted-foreground">
                        <User className="h-2 w-2" />
                        {item.createdBy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onExecuteAction(item)}
                    className="px-1.5 py-[2px] rounded bg-primary/10 text-primary hover:bg-primary/15 dark:bg-navy-950/60 dark:text-navy-300 dark:hover:bg-navy-900/80 text-[9px] font-semibold flex items-center gap-1 transition shadow-2xs"
                    title="Insert link into document sheet"
                  >
                    <Plus className="h-2 w-2" />
                    <span>Insert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/40 dark:hover:text-destructive transition"
                    title="Remove from history"
                  >
                    <Trash2 className="h-3 w-3" />
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
