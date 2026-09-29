/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: useLinksHistory Hook
 * Description:
 * React hook managing the real persistent Links History log,
 * recording inserted web links, email links, document references,
 * bookmarks, and cross-references with direct action handlers.
 * --------------------------------------------------------
 */

import { useState, useCallback, useEffect } from 'react';
import type { LinkHistoryItem, LinkHistoryType } from '../types';
import { linksRepository } from '../repository/LinksRepository';
import { hyperlinkService } from '../services/HyperlinkService';

export function useLinksHistory() {
  const [history, setHistory] = useState<LinkHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshHistory = useCallback(() => {
    setIsRefreshing(true);
    try {
      if (typeof document !== 'undefined') {
        const docAnchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('[contenteditable="true"] a[href]')
        ).filter((a) => !a.closest('aside') && !a.closest('[role="dialog"]') && !a.closest('.toc, .tot, .tof, .appendices-block, [data-appendix]'));

        if (docAnchors.length === 0) {
          linksRepository.clearHistory();
          setHistory([]);
          return [];
        }

        const activeItems: LinkHistoryItem[] = docAnchors.map((a, idx) => {
          const href = a.getAttribute('href') || '';
          const text = a.innerText?.trim() || href;
          const isEmail = href.startsWith('mailto:');
          const isCross = a.getAttribute('data-cross-ref') || href.startsWith('#');
          const type: LinkHistoryType = isEmail ? 'Email' : isCross ? 'Cross Reference' : 'Web URL';

          return {
            id: a.id || `hist_doc_${idx}_${Date.now()}`,
            type,
            displayText: text,
            target: href,
            createdBy: 'Document',
            createdAt: new Date().toISOString(),
          };
        });

        linksRepository.saveHistory(activeItems);
        setHistory(activeItems);
        return activeItems;
      }

      linksRepository.clearHistory();
      setHistory([]);
      return [];
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, []);

  const addHistoryEntry = useCallback(
    (params: {
      type: LinkHistoryType;
      displayText: string;
      target: string;
      targetId?: string;
      createdBy?: string;
      metadata?: Record<string, unknown>;
    }): LinkHistoryItem => {
      const created = linksRepository.addHistoryItem({
        type: params.type,
        displayText: params.displayText,
        target: params.target,
        targetId: params.targetId,
        createdBy: params.createdBy || 'Dr. Sarah Mitchell',
        metadata: params.metadata,
      });
      setHistory((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const removeHistoryEntry = useCallback((id: string) => {
    linksRepository.removeHistoryItem(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearAllHistory = useCallback(() => {
    linksRepository.clearHistory();
    setHistory([]);
  }, []);

  const executeHistoryAction = useCallback(
    (item: LinkHistoryItem) => {
      hyperlinkService.insertLinkFromHistory({
        displayText: item.displayText,
        target: item.target,
        targetId: item.targetId,
        type: item.type,
      });
    },
    []
  );

  // On page load/refresh, sync with actual document content (removing old stale history)
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    history,
    isRefreshing,
    addHistoryEntry,
    removeHistoryEntry,
    clearAllHistory,
    refreshHistory,
    executeHistoryAction,
  };
}
