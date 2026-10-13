/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Bookmark Context
 * Description:
 * React Context managing global document bookmark registry, local storage persistence,
 * selection wrapping, deletion without text removal, and smooth navigation with visual pulse highlights.
 * --------------------------------------------------------
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { BookmarkItem } from '../types';
import { bookmarkService } from '../services/BookmarkService';
import { linksRepository } from '../repository/LinksRepository';

export interface BookmarkContextValue {
  bookmarks: BookmarkItem[];
  addBookmark: (editor: HTMLElement | null, name: string, savedRange?: Range | null) => BookmarkItem | null;
  removeBookmark: (editor: HTMLElement | null, idOrName: string) => boolean;
  navigateToBookmark: (editor: HTMLElement | null, idOrName: string) => boolean;
  refreshBookmarks: (editor: HTMLElement | null) => BookmarkItem[];
  isNameTaken: (name: string) => boolean;
}

export const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    return linksRepository.loadSavedBookmarks();
  });

  // Keep local storage in sync whenever bookmarks change
  useEffect(() => {
    linksRepository.saveBookmarks(bookmarks);
  }, [bookmarks]);

  const refreshBookmarks = useCallback((editor: HTMLElement | null): BookmarkItem[] => {
    if (!editor) return bookmarks;
    const extracted = bookmarkService.listBookmarks(editor);
    setBookmarks(extracted);
    return extracted;
  }, [bookmarks]);

  const addBookmark = useCallback(
    (editor: HTMLElement | null, name: string, savedRange?: Range | null): BookmarkItem | null => {
      if (!name.trim()) return null;
      const created = bookmarkService.createBookmark(editor, name, savedRange);
      if (created) {
        setBookmarks((prev) => {
          const filtered = prev.filter((b) => b.name.toLowerCase() !== name.trim().toLowerCase());
          return [created, ...filtered];
        });
      }
      return created;
    },
    []
  );

  const removeBookmark = useCallback(
    (editor: HTMLElement | null, idOrName: string): boolean => {
      const removed = bookmarkService.deleteBookmark(editor, idOrName);
      if (removed) {
        setBookmarks((prev) => prev.filter((b) => b.id !== idOrName && b.name !== idOrName));
      }
      return removed;
    },
    []
  );

  const navigateToBookmark = useCallback(
    (editor: HTMLElement | null, idOrName: string): boolean => {
      return bookmarkService.navigateToBookmark(editor, idOrName);
    },
    []
  );

  const isNameTaken = useCallback(
    (name: string): boolean => {
      const lower = name.trim().toLowerCase();
      return bookmarks.some((b) => b.name.toLowerCase() === lower);
    },
    [bookmarks]
  );

  const value = useMemo(
    () => ({
      bookmarks,
      addBookmark,
      removeBookmark,
      navigateToBookmark,
      refreshBookmarks,
      isNameTaken,
    }),
    [bookmarks, addBookmark, removeBookmark, navigateToBookmark, refreshBookmarks, isNameTaken]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    return {
      bookmarks: [],
      addBookmark: () => null,
      removeBookmark: () => false,
      navigateToBookmark: () => false,
      refreshBookmarks: () => {},
      isNameTaken: () => false,
    };
  }
  return context;
}

export function useBookmark() {
  return useBookmarks();
}
