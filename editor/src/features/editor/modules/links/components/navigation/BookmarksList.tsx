/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Component: BookmarksList
 * Displays document bookmarks with Add (+), Rename (pencil), Delete (trash),
 * validation rules, and smooth jump-to-bookmark navigation.
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { Bookmark, Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';
import { useEditor } from '@/features/editor/context/EditorContext';
import { cn } from '@/lib/utils';
import type { BookmarkItem } from '../../types';

interface BookmarksListProps {
  selectedBookmarkId: string | null;
  onSelectBookmark: (bookmark: BookmarkItem) => void;
}

export function BookmarksList({
  selectedBookmarkId,
  onSelectBookmark,
}: BookmarksListProps) {
  const { bookmarks, addBookmark, removeBookmark, isNameTaken } = useBookmarks();
  const { editorRef } = useEditor();

  const [isAdding, setIsAdding] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedItem = bookmarks.find(
    (b) => b.id === selectedBookmarkId || b.name === selectedBookmarkId
  );

  const validateName = (name: string, currentOldName?: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Bookmark name cannot be empty.';
    }
    if (!/^[a-zA-Z]/.test(trimmed)) {
      return 'Bookmark name must start with a letter.';
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmed)) {
      return 'Only letters, numbers, and underscores are allowed (no spaces).';
    }
    if (
      (!currentOldName || trimmed.toLowerCase() !== currentOldName.toLowerCase()) &&
      isNameTaken(trimmed)
    ) {
      return `Bookmark "${trimmed}" already exists.`;
    }
    return null;
  };

  const handleStartAdd = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setRenamingId(null);
    setNewBookmarkName('');
    setIsAdding(true);
  };

  const handleSaveNewBookmark = () => {
    setErrorMessage(null);
    const error = validateName(newBookmarkName);
    if (error) {
      setErrorMessage(error);
      return;
    }

    const activeEditor =
      editorRef.current ||
      (typeof document !== 'undefined'
        ? (document.querySelector('[contenteditable="true"]:focus') as HTMLElement) ||
          (document.querySelector('[contenteditable="true"]') as HTMLElement)
        : null);

    if (!activeEditor) {
      setErrorMessage('Please click inside the document editor first.');
      return;
    }

    const created = addBookmark(activeEditor, newBookmarkName.trim());
    if (created) {
      setIsAdding(false);
      setNewBookmarkName('');
      setSuccessMessage(`Added "${created.name}"`);
      onSelectBookmark(created);
      setTimeout(() => setSuccessMessage(null), 2500);
    } else {
      setErrorMessage('Failed to create bookmark in document.');
    }
  };

  const handleStartRename = () => {
    if (!selectedItem) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAdding(false);
    setRenamingId(selectedItem.id);
    setRenameValue(selectedItem.name);
  };

  const handleSaveRename = (target: BookmarkItem) => {
    setErrorMessage(null);
    const error = validateName(renameValue, target.name);
    if (error) {
      setErrorMessage(error);
      return;
    }

    const editor = editorRef.current || (typeof document !== 'undefined' ? document.body : null);
    if (!editor) return;

    // Word behavior: rename = insert new bookmark name & remove old
    removeBookmark(editor, target.id);
    const created = addBookmark(editor, renameValue.trim());

    setRenamingId(null);
    if (created) {
      setSuccessMessage(`Renamed to "${created.name}"`);
      onSelectBookmark(created);
      setTimeout(() => setSuccessMessage(null), 2500);
    }
  };

  const handleDelete = (target: BookmarkItem) => {
    setErrorMessage(null);
    const editor = editorRef.current || (typeof document !== 'undefined' ? document.body : null);
    if (!editor) return;

    const removed = removeBookmark(editor, target.id);
    if (removed) {
      setSuccessMessage(`Removed "${target.name}"`);
      setTimeout(() => setSuccessMessage(null), 2500);
    }
  };

  return (
    <div className="flex flex-col w-full py-1 space-y-2">
      {/* Header with Title and Action Buttons (+, pencil, trash) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <Bookmark className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 stroke-[2]" />
          <span>Bookmarks ({bookmarks.length})</span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleStartAdd}
            className="p-1 rounded text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/40 transition cursor-pointer"
            title="Add bookmark at cursor"
            aria-label="Add bookmark"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleStartRename}
            disabled={!selectedItem}
            className="p-1 rounded text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/40 disabled:opacity-30 transition cursor-pointer"
            title="Rename selected bookmark"
            aria-label="Rename bookmark"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => selectedItem && handleDelete(selectedItem)}
            disabled={!selectedItem}
            className="p-1 rounded text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 disabled:opacity-30 transition cursor-pointer"
            title="Delete selected bookmark"
            aria-label="Delete bookmark"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Add Bookmark Form */}
      {isAdding && (
        <div className="p-2 rounded-lg border border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30 space-y-1.5">
          <span className="text-[10px] font-semibold text-blue-800 dark:text-blue-300">
            Add New Bookmark
          </span>
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              placeholder="e.g. Intro_Summary"
              value={newBookmarkName}
              onChange={(e) => {
                setNewBookmarkName(e.target.value);
                setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNewBookmark();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              className="flex-1 h-7 text-xs px-2 rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleSaveNewBookmark}
              className="h-7 px-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="h-7 px-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 px-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 px-1">
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
          <Bookmark className="h-8 w-8 mb-2 opacity-50 stroke-[1.5]" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            No bookmarks in document
          </p>
          <p className="text-[11px] mt-1 max-w-[220px] leading-relaxed">
            Click the "+" icon above to insert a bookmark at your current cursor position.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-0.5">
          {bookmarks.map((bm) => {
            const isSelected = selectedBookmarkId === bm.id || selectedBookmarkId === bm.name;
            const isRenamingThis = renamingId === bm.id;

            if (isRenamingThis) {
              return (
                <div
                  key={bm.id}
                  className="flex items-center gap-1 p-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800"
                >
                  <input
                    type="text"
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(bm);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    className="flex-1 h-6 text-xs px-1.5 rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveRename(bm)}
                    className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="p-1 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={bm.id}
                type="button"
                onClick={() => onSelectBookmark(bm)}
                className={cn(
                  'flex items-center justify-between w-full px-2 py-1.5 rounded-md text-xs text-left transition-colors cursor-pointer select-none',
                  isSelected
                    ? 'bg-[#E8F0FE] text-[#1967D2] font-semibold dark:bg-[#1E3A8A]/40 dark:text-[#60A5FA]'
                    : 'text-slate-800 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Bookmark
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      isSelected ? 'text-[#1967D2] dark:text-[#60A5FA]' : 'text-slate-400'
                    )}
                  />
                  <span className="truncate" title={bm.name}>
                    {bm.name}
                  </span>
                </div>

                {bm.pageNumber && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                    p. {bm.pageNumber}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
