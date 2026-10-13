/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: LinksPage / Master Links & Navigation Management Panel
 * Description:
 * Word-style Navigation & Links Panel:
 * Top Tabs: 1. NAVIGATION | 2. INTERNAL REFERENCE
 * - Navigation: Word-style Navigation Pane with Search box, Headings tree,
 *   Pages thumbnail strip, Search results, and Bookmarks.
 * - Internal Reference: Web URL, Email links, Bare links convertor & Links history.
 * --------------------------------------------------------
 */

import { useState, useCallback, useEffect } from 'react';
import {
  FileText,
  Link as LinkIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NavigationPanel } from '../components/navigation';
import { InternalRefColumn } from '../components/internalRef';
import { LinksHistorySection } from '../components/history';
import { useLinksHistory } from '../hooks/useLinksHistory';
import { bareLinksService } from '../services/BareLinksService';
import { crossReferenceService } from '../services/CrossReferenceService';
import { useEditor } from '@/features/editor/context/EditorContext';
import { cn } from '@/lib/utils';
import { BookmarkProvider } from '../context/BookmarkContext';
import type { LinkHistoryType } from '../types';

export type MainSectionTab = 'navigation' | 'internal';

function LinksPageContent() {
  const { editorRef, setLeftPanelOpen } = useEditor();
  const [activeMainTab, setActiveMainTab] = useState<MainSectionTab>('navigation');
  const [internalSubTab, setInternalSubTab] = useState<'web' | 'email'>('web');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Delegated click listener to enable clicking links inside contenteditable document pages
  useEffect(() => {
    const handleDocumentLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a') as HTMLAnchorElement | null;
      if (!link) return;

      const inEditor = link.closest('[contenteditable="true"]') || link.closest('section[data-page-id]');
      if (!inEditor) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Internal cross-reference anchor (e.g. #hd_1_..., #fig_1_..., #tbl_1_...)
      if (href.startsWith('#')) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = link.getAttribute('data-target-id') || href.substring(1);
        crossReferenceService.navigateToTarget(null, targetId);
        return;
      }

      // External Web URL
      if (/^https?:\/\//i.test(href)) {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }

      // Mailto link
      if (href.startsWith('mailto:')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = href;
        return;
      }
    };

    document.addEventListener('click', handleDocumentLinkClick, true);
    return () => document.removeEventListener('click', handleDocumentLinkClick, true);
  }, []);

  const {
    history,
    isRefreshing,
    addHistoryEntry,
    removeHistoryEntry,
    clearAllHistory,
    refreshHistory,
    executeHistoryAction,
  } = useLinksHistory();

  const handleLinkInserted = useCallback(
    (item: {
      displayText: string;
      target: string;
      targetId?: string;
      type: LinkHistoryType;
      metadata?: Record<string, unknown>;
    }) => {
      addHistoryEntry({
        type: item.type,
        displayText: item.displayText,
        target: item.target,
        targetId: item.targetId,
        createdBy: 'Dr. Sarah Mitchell',
        metadata: item.metadata,
      });
    },
    [addHistoryEntry]
  );

  // Action: Bare Links conversion (Detect raw URLs in doc text & convert to real hyperlinks)
  const handleConvertBareLinks = () => {
    setFeedbackMsg(null);
    const root = editorRef.current || (typeof document !== 'undefined' ? document.body : null);
    if (!root) {
      setFeedbackMsg({ text: 'Document editor container not found.', type: 'error' });
      return;
    }

    const result = bareLinksService.convertBareLinks(root);

    if (result.count === 0) {
      setFeedbackMsg({
        text: 'No raw bare URLs detected in document text.',
        type: 'error',
      });
    } else {
      // Add each converted URL into Links History
      result.converted.forEach((item) => {
        addHistoryEntry({
          type: 'Web URL',
          displayText: item.displayText,
          target: item.target,
          createdBy: 'Bare Links Convertor',
        });
      });

      setFeedbackMsg({
        text: `Converted ${result.count} bare URL${result.count === 1 ? '' : 's'} into clickable hyperlinks.`,
        type: 'success',
      });
    }

    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="flex h-full w-full flex-col select-none overflow-hidden bg-white dark:bg-[#0D213D] text-slate-800 dark:text-slate-200">
      {/* TOP HEADER: Navigation | Internal Reference + Close Button (Matches Reference Image) */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-2.5 dark:border-[#1E3A5F] dark:bg-[#0E1F36]">
        {/* Navigation & Internal Reference Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveMainTab('navigation')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none',
              activeMainTab === 'navigation'
                ? 'bg-blue-50 text-[#1967D2] font-bold dark:bg-[#1E3A8A]/40 dark:text-[#60A5FA]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 font-medium'
            )}
          >
            <FileText className="h-4 w-4 shrink-0 stroke-[2]" />
            <span>Navigation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('internal')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none',
              activeMainTab === 'internal'
                ? 'bg-blue-50 text-[#1967D2] font-bold dark:bg-[#1E3A8A]/40 dark:text-[#60A5FA]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 font-medium'
            )}
          >
            <LinkIcon className="h-4 w-4 shrink-0 stroke-[2]" />
            <span>Internal Reference</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setLeftPanelOpen(false)}
          className="relative z-40 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer"
          title="Close panel"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {activeMainTab === 'navigation' && (
          <NavigationPanel />
        )}

        {activeMainTab === 'internal' && (
          <div className="flex flex-col space-y-3">
            {/* Internal Reference (Web URL, Email) */}
            <InternalRefColumn
              activeSubTab={internalSubTab}
              onSubTabChange={setInternalSubTab}
              onLinkInserted={handleLinkInserted}
            />

            {/* FEEDBACK TOAST MESSAGE */}
            {feedbackMsg && (
              <div
                className={cn(
                  'flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all',
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
                )}
              >
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* BARE LINKS CONVERTOR */}
            <button
              type="button"
              onClick={handleConvertBareLinks}
              className="w-full h-9 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-xs dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200 cursor-pointer"
            >
              <LinkIcon className="h-4 w-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span>BARE LINKS</span>
              <span className="font-normal text-slate-500">(Convert Raw URLs)</span>
            </button>

            {/* BOTTOM SECTION: LINKS HISTORY (Hidden in Email part only) */}
            {internalSubTab !== 'email' && (
              <div className="flex flex-col pt-1">
                <LinksHistorySection
                  history={history}
                  isRefreshing={isRefreshing}
                  onRefresh={refreshHistory}
                  onExecuteAction={executeHistoryAction}
                  onRemoveItem={removeHistoryEntry}
                  onClearHistory={clearAllHistory}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LinksPage() {
  return (
    <BookmarkProvider>
      <LinksPageContent />
    </BookmarkProvider>
  );
}
