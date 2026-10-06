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
    <div className="flex flex-col bg-white dark:bg-[#0B1520] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs select-none space-y-2">
      {/* Reference Type Pills Grid */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Reference Type
          </label>
          <button
            type="button"
            onClick={handleManualRefresh}
            title="Refresh targets"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
          >
            <RefreshCw className={cn("h-3 w-3", isScanning && "animate-spin text-blue-500")} />
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
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111D29] dark:text-slate-300'
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
        <div className="p-2 rounded-md border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-1.5">
          <label className="block text-[10px] font-bold text-amber-800 dark:text-amber-300">
            + Create Bookmark at Selection / Cursor
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
              placeholder="e.g. SafetySummary"
              className="flex-1 h-7 px-2 text-xs rounded border border-amber-200 bg-white dark:bg-[#111D29] text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateBookmark();
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreateBookmark}
              className="h-7 px-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          {bookmarkSuccess && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {bookmarkSuccess}
            </p>
          )}
        </div>
      )}

      {/* For Which Target Dropdown */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            For which target ({targets.length} found)
          </label>
        </div>
        {targets.length === 0 ? (
          <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 dark:bg-[#111D29] rounded-md border border-dashed border-slate-300 dark:border-slate-700">
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
                className="w-full text-left px-2.5 py-1.5 text-[11px] rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-[#111D29] dark:hover:bg-[#1A2C3D] dark:border-slate-800 dark:text-slate-300 transition"
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
              className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-100 flex items-center justify-between transition-colors"
            >
              <span className="truncate pr-2">
                {targets.find((t) => t.id === selectedTargetId)?.title || 'Select a target'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full max-h-[180px] overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-[#111D29] py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                  {targets.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-500 italic">No targets found</div>
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
                          "w-full text-left px-3 py-1.5 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors truncate",
                          selectedTargetId === t.id && "bg-blue-50/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
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
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
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
            className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm active:scale-[0.99]"
          >
            <span>Insert Reference</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
