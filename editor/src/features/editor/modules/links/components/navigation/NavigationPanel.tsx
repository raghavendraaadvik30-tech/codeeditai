/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Component: NavigationPanel
 * Word-style Navigation Pane providing:
 * - "Search Document" SearchBox with magnifier, clear (x) button & toggles
 * - 4 Sub-Tabs: Headings, Pages, Results, Bookmarks
 * - Real-time synchronization with document cursor/selection, edits,
 *   active page thumbnail centering, and heading tree highlighting.
 * --------------------------------------------------------
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  FileText,
  File,
  Bookmark,
} from 'lucide-react';
import { SearchBox } from './SearchBox';
import { HeadingsTree } from './HeadingsTree';
import { PagesStrip } from './PagesStrip';
import { SearchResults } from './SearchResults';
import { BookmarksList } from './BookmarksList';
import { navigationOutlineService } from '../../services/NavigationOutlineService';
import { navigationPagesService } from '../../services/NavigationPagesService';
import { wordSearchService } from '../../services/wordSearch';
import { bookmarkService } from '../../services/BookmarkService';
import { useNavigationStore } from '../../store/navigationStore';
import { useEditor } from '@/features/editor/context/EditorContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { useDocumentModel } from '@/features/editor/store/documentModel';
import type {
  NavigationSubTab,
  HeadingNode,
  SearchResultItem,
  PageThumbnailItem,
} from '../../types/navigation.types';
import type { BookmarkItem } from '../../types';
import { cn } from '@/lib/utils';

interface NavigationPanelProps {
  initialSubTab?: NavigationSubTab;
}

export function NavigationPanel({ initialSubTab = 'headings' }: NavigationPanelProps) {
  const { editorRef } = useEditor();
  const { refreshBookmarks } = useBookmarks();
  const { model, activePage, setActivePage } = useDocumentModel();

  const {
    query,
    totalCount,
  } = useNavigationStore();

  const [activeSubTab, setActiveSubTab] = useState<NavigationSubTab>(initialSubTab);

  // Data states
  const [headingNodes, setHeadingNodes] = useState<HeadingNode[]>([]);
  const [pages, setPages] = useState<PageThumbnailItem[]>([]);

  // Active item tracking
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);

  const editDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Scan and refresh Headings & Pages from document
  const refreshOutlineAndPages = useCallback(() => {
    const root = editorRef.current || (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;

    // Scan Headings
    const flat = navigationOutlineService.extractFlatHeadings(root);
    const tree = navigationOutlineService.buildHeadingTree(flat, query);
    setHeadingNodes(tree);

    // Scan Pages using deduplicated sections and model HTML
    const scannedPages = navigationPagesService.getPages(activePage ?? undefined, model?.pageHtml);
    setPages(scannedPages);

    // Refresh Bookmarks
    refreshBookmarks(root);
  }, [editorRef, query, activePage, model?.pageHtml, refreshBookmarks]);

  // Initial scan and background interval (poll every 4s while panel is open)
  useEffect(() => {
    refreshOutlineAndPages();

    const interval = setInterval(() => {
      refreshOutlineAndPages();
    }, 4000);

    return () => clearInterval(interval);
  }, [refreshOutlineAndPages]);

  // Automatically switch to 'results' tab when searching if in pages or bookmarks
  useEffect(() => {
    if (query.trim() && activeSubTab !== 'results' && activeSubTab !== 'headings') {
      setActiveSubTab('results');
    }
  }, [query, activeSubTab]);

  // 2. Selection change listener: Sync active heading & active page with document cursor
  useEffect(() => {
    const handleSelectionChange = () => {
      if (typeof window === 'undefined') return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const anchor = selection.anchorNode;
      if (!anchor) return;

      const element = anchor.nodeType === Node.ELEMENT_NODE ? (anchor as HTMLElement) : anchor.parentElement;
      if (!element) return;

      // Check if cursor is inside a document page
      const pageEl = element.closest('section[data-page-id]');
      if (pageEl) {
        const pageId = pageEl.getAttribute('data-page-id');
        if (pageId && pageId !== activePage) {
          setActivePage(pageId);
        }
        const pageNum = navigationOutlineService.getPageNumber(pageEl);
        setActivePageNumber(pageNum);
      }

      // Check if cursor is near a heading
      const headingEl = element.closest(
        'h1, h2, h3, h4, h5, h6, [data-heading], [data-style*="Heading"], [data-style*="heading"]'
      );
      if (headingEl && headingEl.id) {
        setActiveHeadingId(headingEl.id);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [activePage, setActivePage]);

  // 3. Document edited while search is active:
  // Re-run search after 500 ms of no typing, and keep current result when possible.
  useEffect(() => {
    const handleDocumentInput = () => {
      if (editDebounceTimerRef.current) {
        clearTimeout(editDebounceTimerRef.current);
      }

      editDebounceTimerRef.current = setTimeout(async () => {
        refreshOutlineAndPages();
        const currentQuery = useNavigationStore.getState().query;
        if (currentQuery.trim()) {
          const prevIdx = useNavigationStore.getState().currentIndex;
          await wordSearchService.search(currentQuery);
          if (prevIdx >= 0) {
            useNavigationStore.getState().setCurrentIndex(prevIdx);
          }
        }
      }, 500);
    };

    document.addEventListener('input', handleDocumentInput);
    return () => {
      document.removeEventListener('input', handleDocumentInput);
      if (editDebounceTimerRef.current) clearTimeout(editDebounceTimerRef.current);
    };
  }, [refreshOutlineAndPages]);

  // Actions
  const handleSelectHeading = (node: HeadingNode) => {
    setActiveHeadingId(node.id);
    setActivePageNumber(node.pageNumber);
    navigationOutlineService.navigateToHeading(node);
  };

  const handleSelectPage = (page: PageThumbnailItem) => {
    setActivePage(page.pageId);
    setActivePageNumber(page.pageNumber);
    navigationPagesService.navigateToPage(page);
  };

  const handleSelectMatch = (match: SearchResultItem) => {
    setActivePageNumber(match.pageNumber);
    // Find page ID corresponding to pageNumber and update activePage
    const matchingPage = pages.find((p) => p.pageNumber === match.pageNumber);
    if (matchingPage) {
      setActivePage(matchingPage.pageId);
    }
  };

  const handleSelectBookmark = (bm: BookmarkItem) => {
    setSelectedBookmarkId(bm.id);
    if (bm.pageNumber) {
      setActivePageNumber(bm.pageNumber);
    }
    const root = editorRef.current || (typeof document !== 'undefined' ? document.body : null);
    bookmarkService.navigateToBookmark(root, bm.id);
  };

  const formattedResultCount = totalCount > 500 ? '500+' : `${totalCount}`;

  const subTabs: {
    id: NavigationSubTab;
    label: string;
    icon: typeof FileText;
    count?: string | number;
  }[] = [
    { id: 'headings', label: 'Headings', icon: FileText },
    { id: 'pages', label: 'Pages', icon: File, count: pages.length },
    {
      id: 'results',
      label: 'Results',
      icon: Search,
      count: totalCount > 0 ? formattedResultCount : undefined,
    },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <div className="flex flex-col w-full h-full select-none space-y-3">
      {/* 1. TOP: "Search Document" Search Box */}
      <SearchBox onSearchComplete={refreshOutlineAndPages} />

      {/* 2. SUB-TABS: Headings | Pages | Results | Bookmarks */}
      <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-slate-100/80 dark:bg-[#111D29] border border-slate-200 dark:border-[#294564]">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all select-none cursor-pointer',
                isActive
                  ? 'bg-white text-[#1967D2] font-semibold border border-slate-200/80 shadow-xs dark:bg-[#1E3A8A]/40 dark:text-[#60A5FA] dark:border-[#2563EB]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2]" />
              <span className="truncate">{tab.label}</span>
              {tab.id === 'results' && totalCount > 0 && (
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 font-bold">
                  {formattedResultCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE VIEW CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        {activeSubTab === 'headings' && (
          <HeadingsTree
            nodes={headingNodes}
            activeHeadingId={activeHeadingId}
            searchQuery={query}
            onSelectHeading={handleSelectHeading}
          />
        )}

        {activeSubTab === 'pages' && (
          <PagesStrip
            pages={pages}
            activePageNumber={activePageNumber}
            activePageId={activePage}
            onSelectPage={handleSelectPage}
          />
        )}

        {activeSubTab === 'results' && (
          <SearchResults onSelectMatch={handleSelectMatch} />
        )}

        {activeSubTab === 'bookmarks' && (
          <BookmarksList
            selectedBookmarkId={selectedBookmarkId}
            onSelectBookmark={handleSelectBookmark}
          />
        )}
      </div>
    </div>
  );
}
