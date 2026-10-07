/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: HyperlinkManager Component
 * Description:
 * Container component for creating, scanning, and managing all document hyperlinks.
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { HyperlinkList } from './HyperlinkList';
import { HyperlinkDialog } from './HyperlinkDialog';
import { useHyperlink } from '../../hooks/useHyperlink';
import { useBookmarks } from '../../context/BookmarkContext';
import { useEditor } from '@/features/editor/context/EditorContext';
import type { CreateLinkPayload, LinkModel } from '../../types';

export function HyperlinkManager() {
  const { editorRef } = useEditor();
  const { links, refreshLinks, insertLink, removeLink } = useHyperlink();
  const { bookmarks, navigateToBookmark } = useBookmarks();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      refreshLinks(editorRef.current);
    }
  }, [editorRef, refreshLinks]);

  const handleRefresh = () => {
    if (editorRef.current) {
      refreshLinks(editorRef.current);
    }
  };

  const handleCreateLink = (payload: CreateLinkPayload) => {
    insertLink(editorRef.current, payload);
  };

  const handleNavigate = (link: LinkModel) => {
    if (link.target.startsWith('#')) {
      const targetId = link.target.substring(1);
      navigateToBookmark(editorRef.current, targetId);
    }
  };

  const handleRemove = (link: LinkModel) => {
    if (!editorRef.current) return;
    const escaped = CSS.escape(link.target);
    const anchor = editorRef.current.querySelector<HTMLAnchorElement>(`a[href="${escaped}"]`);
    if (anchor) {
      removeLink(anchor);
      refreshLinks(editorRef.current);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider dark:text-muted-foreground">
          Hyperlinks ({links.length})
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRefresh}
            title="Scan document for links"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-secondary-foreground dark:hover:bg-muted"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex h-6 items-center gap-1 rounded bg-[#0078d4] px-2 text-[11px] font-semibold text-primary-foreground hover:bg-[#005a9e]"
          >
            <Plus className="h-3 w-3" /> Add Link
          </button>
        </div>
      </div>

      <HyperlinkList
        links={links}
        onNavigate={handleNavigate}
        onRemove={handleRemove}
      />

      <HyperlinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        availableBookmarks={bookmarks}
        onSave={handleCreateLink}
      />
    </div>
  );
}
