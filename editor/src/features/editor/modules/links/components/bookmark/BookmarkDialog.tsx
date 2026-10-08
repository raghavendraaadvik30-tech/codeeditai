/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: BookmarkDialog Component
 * Description:
 * Modal dialog for registering named bookmarks at the current editor cursor or selection.
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { Bookmark, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { LinkButton } from '../common/LinkButton';
import { useBookmarks } from '../../context/BookmarkContext';
import { useEditor } from '@/features/editor/context/EditorContext';

export interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BookmarkDialog({ open, onOpenChange, onSuccess }: BookmarkDialogProps) {
  const { editorRef } = useEditor();
  const { addBookmark, isNameTaken } = useBookmarks();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Bookmark name cannot be empty');
      return;
    }

    if (isNameTaken(trimmed)) {
      setError('A bookmark with this name already exists');
      return;
    }

    const created = addBookmark(editorRef.current, trimmed);
    if (created) {
      setName('');
      setError(null);
      onOpenChange(false);
      onSuccess?.();
    } else {
      setError('Failed to insert bookmark into editor');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105 bg-card dark:bg-[#0E1A29] border border-secondary dark:border-muted p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 border-b border-muted dark:border-muted">
          <DialogTitle className="text-sm font-semibold text-foreground dark:text-primary-foreground flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-warning-500" />
            Add Bookmark
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-secondary-foreground dark:text-muted-foreground">Bookmark Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              placeholder="e.g. Protocol_Objectives_Sec2"
              className="h-8 w-full rounded-md border border-secondary bg-card px-3 outline-none dark:border-secondary-foreground dark:bg-[#07131E] dark:text-primary-foreground focus:border-warning-500"
              autoFocus
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            Bookmarks allow you to create jump targets in your document without altering visible content. If text is currently selected, it will be wrapped in this bookmark.
          </p>

          {error && (
            <div className="flex items-center gap-1.5 text-[11px] text-destructive font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t border-muted bg-muted/50 dark:border-muted dark:bg-[#07131E] flex items-center justify-end gap-2">
          <LinkButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </LinkButton>
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-7 items-center justify-center rounded-md bg-warning-500 px-3 text-xs font-semibold text-primary-foreground hover:bg-warning-600 transition-colors"
          >
            Create Bookmark
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
