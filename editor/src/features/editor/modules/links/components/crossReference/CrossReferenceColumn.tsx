/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Column 3 - CROSS REFERENCES
 * Description:
 * Column supporting automatic cross-referencing to Headings,
 * Figures, Tables, Bookmarks, Numbered lists, and Pages created in document.
 * --------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Heading as HeadingIcon,
  Image as FigureIcon,
  Table as TableIcon,
  Bookmark as BookmarkIcon,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { useEditor } from '@/features/editor/context/EditorContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { crossReferenceService } from '../../services/CrossReferenceService';
import type { CrossReferenceTarget, CrossReferenceTargetItem, LinkHistoryType } from '../../types';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface CrossReferenceColumnProps {
  onLinkInserted?: (item: {
    displayText: string;
    target: string;
    targetId: string;
    type: LinkHistoryType;
  }) => void;
}

export function CrossReferenceColumn({ onLinkInserted }: CrossReferenceColumnProps) {
  const { editorRef } = useEditor();
  const { bookmarks, addBookmark } = useBookmarks();

  const [selectedType, setSelectedType] = useState<CrossReferenceTarget>('heading');
  const [targets, setTargets] = useState<CrossReferenceTargetItem[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Inline Bookmark creation state
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [bookmarkSuccess, setBookmarkSuccess] = useState<string | null>(null);

  // Feedback status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const referenceTypes: { id: CrossReferenceTarget; label: string; icon: typeof HeadingIcon }[] = [
    { id: 'heading', label: 'Heading', icon: HeadingIcon },
    { id: 'figure', label: 'Figure', icon: FigureIcon },
    { id: 'table', label: 'Table', icon: TableIcon },
    { id: 'bookmark', label: 'Bookmark', icon: BookmarkIcon },
  ];

  const currentTypeLabel = referenceTypes.find((r) => r.id === selectedType)?.label || 'Target';

  // Automatically fetch targets created in the document
  const refreshTargets = useCallback(() => {
    const root = editorRef.current || null;
    const autoDetected = crossReferenceService.getAutoDetectedTargets(root, selectedType);

    setTargets(autoDetected);
    if (autoDetected.length > 0 && (!selectedTargetId || !autoDetected.some((t) => t.id === selectedTargetId))) {
      setSelectedTargetId(autoDetected[0].id);
    }
  }, [editorRef, selectedType, selectedTargetId]);

  // Document selection auto-matching (e.g. user highlights "1. Introduction", "Figure 1", "Table 1", "Section 3")
  useEffect(() => {
    const handleSelectionChange = () => {
      if (typeof window === 'undefined') return;
      const sel = window.getSelection();
      const selText = sel ? sel.toString().trim() : '';
      if (!selText || selText.length > 80) return;

      const lower = selText.toLowerCase();

      let detectedType: CrossReferenceTarget | null = null;
      if (/^fig(ure|\.)?\s*\d+/i.test(lower)) {
        detectedType = 'figure';
      } else if (/^table\s*\d+/i.test(lower)) {
        detectedType = 'table';
      } else if (/^(section|chapter)\s*\d+|^\d+(\.\d+)*\s+[a-z]/i.test(lower)) {
        detectedType = 'heading';
      }

      if (detectedType && detectedType !== selectedType) {
        setSelectedType(detectedType);
      }

      // Find matching target in current autoDetected targets
      const root = editorRef.current || null;
      const currentType = detectedType || selectedType;
      const autoDetected = crossReferenceService.getAutoDetectedTargets(root, currentType);
      const matched = autoDetected.find((t) => {
        const titleLower = t.title.toLowerCase();
        return titleLower.includes(lower) || lower.includes(titleLower.substring(0, 15));
      });

      if (matched) {
        setSelectedTargetId(matched.id);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef, selectedType]);

  // Live real-time sync whenever the user types in the document
  useEffect(() => {
    const handleDocumentInput = () => {
      refreshTargets();
    };

    document.addEventListener('input', handleDocumentInput);
    return () => document.removeEventListener('input', handleDocumentInput);
  }, [refreshTargets]);

  useEffect(() => {
    refreshTargets();
  }, [selectedType, bookmarks, refreshTargets]);

  // Background interval auto-sync
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTargets();
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshTargets]);

  /**
   * Creates a bookmark at the user's current cursor position or selection in the document.
   */
  const handleCreateBookmark = () => {
    setError(null);
    setBookmarkSuccess(null);

    const trimmed = newBookmarkName.trim();
    if (!trimmed) {
      setError('Please enter a name for the bookmark.');
      return;
    }

    const activeEditor =
      editorRef.current ||
      (typeof document !== 'undefined'
        ? (document.querySelector('[contenteditable="true"]:focus') as HTMLElement) ||
          (document.querySelector('[contenteditable="true"]') as HTMLElement)
        : null);

    if (!activeEditor) {
      setError('Please click inside the document editor first.');
      return;
    }

    const created = addBookmark(activeEditor, trimmed);
    if (created) {
      setBookmarkSuccess(`Bookmark "${created.name}" created!`);
      setNewBookmarkName('');
      refreshTargets();
      setSelectedTargetId(created.id);
      setTimeout(() => {
        setBookmarkSuccess(null);
      }, 3000);
    } else {
      setError('Failed to create bookmark in document.');
    }
  };

  /**
   * Inserts a cross-reference link pointing to target.id.
   */
  const handleInsertReference = () => {
    setError(null);
    setSuccessMsg(null);

    const targetItem = targets.find((t) => t.id === selectedTargetId);
    if (!targetItem) {
      setError(`Please select a ${currentTypeLabel.toLowerCase()} target first.`);
      return;
    }

    const editor = editorRef.current;
    const inserted = crossReferenceService.insertCrossReference(
      editor,
      targetItem,
      undefined,
      false // never include page number
    );

    if (inserted) {
      const finalLabel = targetItem.title;

      setSuccessMsg(`Inserted reference to "${targetItem.title}"`);
      if (onLinkInserted) {
        onLinkInserted({
          displayText: finalLabel,
          target: `#${targetItem.id}`,
          targetId: targetItem.id,
          type: 'Cross Reference',
        });
      }

      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError('Failed to insert cross reference.');
    }
  };

  const handleManualRefresh = () => {
    setIsScanning(true);
    const root = editorRef.current || null;
    const autoDetected = crossReferenceService.getAutoDetectedTargets(root, selectedType);
    setTargets(autoDetected);
    if (autoDetected.length > 0) {
      if (!selectedTargetId || !autoDetected.some((t) => t.id === selectedTargetId)) {
        setSelectedTargetId(autoDetected[0].id);
      }
    } else {
      setSelectedTargetId('');
    }
    setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  return (
    <div className="flex flex-col bg-card dark:bg-[#0B1520] border border-secondary dark:border-muted rounded-lg p-2.5 shadow-xs select-none space-y-2">
      {/* Reference Type Pills Grid */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
            Reference Type
          </label>
          <button
            type="button"
            onClick={handleManualRefresh}
            title="Refresh targets"
            className="text-muted-foreground hover:text-secondary-foreground dark:hover:text-muted-foreground transition-colors p-0.5"
          >
            <RefreshCw className={cn("h-3 w-3", isScanning && "animate-spin text-primary")} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {referenceTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedType(type.id);
                  setError(null);
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition border select-none',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary/90 dark:border-primary dark:bg-navy-950/40 dark:text-navy-300 shadow-xs'
                    : 'border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-[#111D29] dark:text-muted-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookmark creation tool when Bookmark is selected */}
      {selectedType === 'bookmark' && (
        <div className="p-2 rounded-md border border-warning-200 bg-warning-50/50 dark:border-warning-900/50 dark:bg-warning-950/20 space-y-1.5">
          <label className="block text-[10px] font-bold text-warning-800 dark:text-warning-300">
            + Create Bookmark at Selection / Cursor
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
              placeholder="e.g. SafetySummary"
              className="flex-1 h-7 px-2 text-xs rounded border border-warning-200 bg-card dark:bg-[#111D29] text-foreground dark:text-muted-foreground focus:outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateBookmark();
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreateBookmark}
              className="h-7 px-2.5 rounded bg-warning-600 hover:bg-warning-700 text-primary-foreground text-[11px] font-semibold flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          {bookmarkSuccess && (
            <p className="text-[10px] text-success-600 dark:text-success-400 font-medium">
              {bookmarkSuccess}
            </p>
          )}
        </div>
      )}

      {/* For Which Target Dropdown */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground">
            For which target ({targets.length} found)
          </label>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/90 dark:text-primary"
            title="Scan document for targets"
          >
            <RefreshCw className={cn("h-3 w-3", isScanning && "animate-spin")} />
            Refresh
          </button>
        </div>
        {targets.length === 0 ? (
          <div className="p-2 text-center text-xs text-muted-foreground bg-muted dark:bg-[#111D29] rounded-md border border-dashed border-border dark:border-secondary-foreground">
            {selectedType === 'bookmark'
              ? 'No bookmarks in document yet. Type a name above and click "Add".'
              : `No ${currentTypeLabel.toLowerCase()}s created in the document yet.`}
          </div>
        ) : selectedType === 'bookmark' ? (
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  crossReferenceService.navigateToTarget(editorRef.current, t.id);
                  setSuccessMsg(`Navigated to ${t.title}`);
                  setTimeout(() => setSuccessMsg(null), 2000);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] rounded bg-muted hover:bg-muted border border-secondary text-secondary-foreground dark:bg-[#111D29] dark:hover:bg-[#1A2C3D] dark:border-muted dark:text-muted-foreground transition"
              >
                {t.title}
              </button>
            ))}
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!isDropdownOpen) refreshTargets();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-secondary bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted flex items-center justify-between transition-colors"
            >
              <span className="truncate pr-2">
                {targets.find((t) => t.id === selectedTargetId)?.title || 'Select a target'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full max-h-45 overflow-y-auto rounded-md border border-secondary bg-card shadow-lg dark:border-secondary-foreground dark:bg-[#111D29] py-1 scrollbar-thin scrollbar-thumb-secondary dark:scrollbar-thumb-secondary-foreground">
                  {targets.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">No targets found</div>
                  ) : (
                    targets.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTargetId(t.id);
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted dark:hover:bg-muted transition-colors truncate",
                          selectedTargetId === t.id && "bg-primary/50 text-primary dark:bg-navy-900/20 dark:text-primary font-medium"
                        )}
                        title={t.title}
                      >
                        {t.title}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Custom Reference Label & Insert Button (hidden for Bookmarks) */}
      {selectedType !== 'bookmark' && (
        <>
          {/* Error / Success Feedback */}
          {error && (
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[11px] dark:bg-destructive/40 dark:border-destructive/60 dark:text-destructive/30">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-success-50 border border-success-200 text-success-700 text-[11px] dark:bg-success-950/40 dark:border-success-800 dark:text-success-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Insert Reference Button */}
          <button
            type="button"
            disabled={targets.length === 0}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertReference}
            className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm active:scale-[0.99]"
          >
            <span>Insert Reference</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
