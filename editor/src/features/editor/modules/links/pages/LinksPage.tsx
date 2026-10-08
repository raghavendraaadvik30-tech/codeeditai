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
    { id: 'crossRef', label: 'CROSS REFERENCES', number: '2' },
  ];

  return (
    <div className="flex h-full w-full flex-col select-none overflow-y-auto bg-[#F8FAFC] dark:bg-[#07131E] text-foreground dark:text-muted">
      {/* Top Fixed Area (Tabs + Form + Controls) - Fits neatly without scrollbar */}
      <div className="shrink-0 p-2.5 space-y-2">
        {/* Main Selectable Tabs (Side-by-Side: 1. INTERNAL REFERENCE | 2. CROSS REFERENCES) */}
        <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/80 dark:bg-[#111D29] border border-secondary dark:border-muted">
          {mainTabs.map((tab) => {
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-0.5 py-1 px-0.5 rounded-md text-[10px] font-bold tracking-tight transition-all select-none whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-secondary-foreground hover:text-foreground hover:bg-secondary/50 dark:text-muted-foreground dark:hover:text-primary-foreground dark:hover:bg-muted/60'
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
              'flex items-center gap-1.5 p-1.5 rounded-md border text-[11px] font-medium transition-all',
              feedbackMsg.type === 'success'
                ? 'bg-success-50 border-success-200 text-success-800 dark:bg-success-950/40 dark:border-success-800 dark:text-success-300'
                : 'bg-destructive/10 border-destructive/20 text-destructive/60 dark:bg-destructive/40 dark:border-destructive/60 dark:text-destructive/30'
            )}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-600 dark:text-success-400" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive dark:text-destructive" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* CONTROLS BELOW MAIN SECTIONS */}
        <div className="w-full pt-0.5">
          {/* BARE LINKS CONVERTOR */}
          <button
            type="button"
            onClick={handleConvertBareLinks}
            className="w-full h-7.5 flex items-center justify-center gap-1.5 rounded-md border border-secondary bg-card text-secondary-foreground text-xs font-semibold hover:bg-muted hover:text-foreground transition shadow-2xs dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
          >
            <LinkIcon className="h-3.5 w-3.5 text-primary dark:text-primary" />
            <span>BARE LINKS (Convert Raw URLs)</span>
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
