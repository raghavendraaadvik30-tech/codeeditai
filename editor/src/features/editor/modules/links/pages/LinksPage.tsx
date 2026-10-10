/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: LinksPage / Master Links Management Panel
 * Description:
 * Compact, tabbed Links Panel layout showing:
 * Top Tabs: 1. INTERNAL REF | 2. DOCUMENTS | 3. CROSS REFERENCES
 * Only ONE active section expanded at a time.
 * Controls below active section:
 *  - SET ALL REFERENCES TO BLUE TEXT (Visual formatting)
 *  - BARE LINKS (Detects raw URLs in doc text & converts to real clickable hyperlinks)
 * Bottom: LINKS HISTORY.
 * --------------------------------------------------------
 */

import { useState, useCallback, useEffect } from 'react';
import { Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { InternalRefColumn } from '../components/internalRef';
import { CrossReferenceColumn } from '../components/crossReference';
import { LinksHistorySection } from '../components/history';
import { useLinksHistory } from '../hooks/useLinksHistory';
import { bareLinksService } from '../services/BareLinksService';
import { crossReferenceService } from '../services/CrossReferenceService';
import { useEditor } from '@/features/editor/context/EditorContext';
import { cn } from '@/lib/utils';
import { BookmarkProvider } from '../context/BookmarkContext';
import type { LinkHistoryType } from '../types';

export type MainSectionTab = 'internal' | 'crossRef';

function LinksPageContent() {
  const { editorRef } = useEditor();
  const [activeMainTab, setActiveMainTab] = useState<MainSectionTab>('internal');
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

  const mainTabs: { id: MainSectionTab; label: string; number: string }[] = [
    { id: 'internal', label: 'INTERNAL REFERENCE', number: '1' },
    { id: 'crossRef', label: 'CROSS REFERENCE', number: '2' },
  ];

  return (
    <div className="flex h-full w-full flex-col select-none overflow-y-auto bg-white dark:bg-[#0D213D] text-button-primary-foreground dark:text-muted">
      {/* Top Fixed Area (Tabs + Form + Controls) - Fits neatly without scrollbar */}
      <div className="shrink-0 p-3 space-y-2.5">
        {/* Main Selectable Tabs (Side-by-Side: 1. INTERNAL REFERENCE | 2. CROSS REFERENCES) */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#111D29] border border-[#E2E8F0] dark:border-[#294564]">
          {mainTabs.map((tab) => {
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={cn(
                  'flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all select-none whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-button-primary text-button-primary-foreground shadow-xs font-bold dark:bg-[#1E3A8A] dark:text-white'
                    : 'text-[#64748B] hover:text-[#1E3A5F] dark:text-slate-400 dark:hover:text-white'
                )}
              >
                <span>{tab.number}.</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE SECTION CONTENT (Only ONE open at a time) */}
        <div className="w-full">
          {activeMainTab === 'internal' && (
            <InternalRefColumn
              activeSubTab={internalSubTab}
              onSubTabChange={setInternalSubTab}
              onLinkInserted={handleLinkInserted}
            />
          )}

          {activeMainTab === 'crossRef' && (
            <CrossReferenceColumn onLinkInserted={handleLinkInserted} />
          )}
        </div>

        {/* FEEDBACK TOAST MESSAGE */}
        {feedbackMsg && (
          <div
            className={cn(
              'flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all',
              feedbackMsg.type === 'success'
                ? 'bg-success-50 border-success-200 text-success-800 dark:bg-success-950/40 dark:border-success-800 dark:text-success-300'
                : 'bg-destructive/10 border-destructive/20 text-destructive/60 dark:bg-destructive/40 dark:border-destructive/60 dark:text-destructive/30'
            )}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success-600 dark:text-success-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive dark:text-destructive" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* CONTROLS BELOW MAIN SECTIONS */}
        <div className="w-full pt-1">
          {/* BARE LINKS CONVERTOR */}
          <button
            type="button"
            onClick={handleConvertBareLinks}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-xs dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200 cursor-pointer"
          >
            <LinkIcon className="h-4 w-4 text-[#2563EB] dark:text-[#38BDF8]" />
            <span>BARE LINKS</span>
            <span className="font-normal text-slate-500">(Convert Raw URLs)</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: LINKS HISTORY (Hidden in Email part only) */}
      {!(activeMainTab === 'internal' && internalSubTab === 'email') && (
        <div className="flex flex-col px-2.5 pb-2.5 pt-0">
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
  );
}

export default function LinksPage() {
  return (
    <BookmarkProvider>
      <LinksPageContent />
    </BookmarkProvider>
  );
}
