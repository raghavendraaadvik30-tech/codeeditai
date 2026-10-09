/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: BookmarkManager Component
 * Description:
 * Main Bookmark management panel with creation trigger, bookmark listing,
 * refresh synchronization, and navigation jump actions.
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { BookmarkList } from './BookmarkList';

import { BookmarkDialog } from './BookmarkDialog';
import { useBookmarks } from '../../context/BookmarkContext';
import { useEditor } from '@/features/editor/context/EditorContext';
import type { BookmarkItem } from '../../types';

export function BookmarkManager() {
  const { editorRef } = useEditor();
  const { bookmarks, removeBookmark, navigateToBookmark, refreshBookmarks } = useBookmarks();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      refreshBookmarks(editorRef.current);
    }
  }, [editorRef, refreshBookmarks]);

  const handleRefresh = () => {
    if (editorRef.current) {
      refreshBookmarks(editorRef.current);
    }
  };

  const handleNavigate = (bm: BookmarkItem) => {
    navigateToBookmark(editorRef.current, bm.id);
  };

  const handleDelete = (bm: BookmarkItem) => {
    removeBookmark(editorRef.current, bm.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-10px font-bold text-muted-foreground uppercase tracking-wider dark:text-muted-foreground">
          Bookmarks ({bookmarks.length})
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRefresh}
            title="Scan document for bookmarks"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-secondary-foreground dark:hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex h-6 items-center gap-1 rounded bg-warning-500 px-2 text-11px font-semibold text-primary-foreground hover:bg-warning-600 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Bookmark
          </button>
        </div>
      </div>

      <BookmarkList
        bookmarks={bookmarks}
        onNavigate={handleNavigate}
        onDelete={handleDelete}
      />

      <BookmarkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
