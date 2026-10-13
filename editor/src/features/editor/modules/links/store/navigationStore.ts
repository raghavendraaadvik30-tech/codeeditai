/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Store: navigationStore (Zustand)
 * Manages search query, results, current selection index,
 * search status (idle, searching, done, error), options,
 * and keyboard navigation next/previous wrap-around.
 * --------------------------------------------------------
 */

import { create } from 'zustand';
import type { SearchResultItem, SearchStatus, SearchOptions } from '../types/navigation.types';

export interface NavigationState {
  query: string;
  results: SearchResultItem[];
  currentIndex: number;
  status: SearchStatus;
  errorMessage: string | null;
  totalCount: number;
  isCollapsed: boolean;
  options: SearchOptions;
  requestId: number;

  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResultItem[], totalCount?: number) => void;
  setCurrentIndex: (index: number) => void;
  setStatus: (status: SearchStatus, errorMessage?: string | null) => void;
  setOptions: (options: Partial<SearchOptions>) => void;
  toggleCollapsed: () => void;
  incrementRequestId: () => number;
  next: () => number;
  previous: () => number;
  clear: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  query: '',
  results: [],
  currentIndex: -1,
  status: 'idle',
  errorMessage: null,
  totalCount: 0,
  isCollapsed: false,
  options: {
    matchCase: false,
    matchWholeWord: false,
  },
  requestId: 0,

  setQuery: (query: string) => {
    set({ query });
  },

  setResults: (results: SearchResultItem[], totalCount?: number) => {
    const total = totalCount !== undefined ? totalCount : results.length;
    set({
      results,
      totalCount: total,
      currentIndex: results.length > 0 ? 0 : -1,
      status: 'done',
      errorMessage: null,
    });
  },

  setCurrentIndex: (index: number) => {
    const { results } = get();
    if (results.length === 0) {
      set({ currentIndex: -1 });
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, results.length - 1));
    set({ currentIndex: safeIndex });
  },

  setStatus: (status: SearchStatus, errorMessage: string | null = null) => {
    set({ status, errorMessage });
  },

  setOptions: (options: Partial<SearchOptions>) => {
    set((state) => ({
      options: { ...state.options, ...options },
    }));
  },

  toggleCollapsed: () => {
    set((state) => ({ isCollapsed: !state.isCollapsed }));
  },

  incrementRequestId: () => {
    const nextId = get().requestId + 1;
    set({ requestId: nextId });
    return nextId;
  },

  next: () => {
    const { results, currentIndex } = get();
    if (results.length === 0) return -1;
    const nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
    set({ currentIndex: nextIndex });
    return nextIndex;
  },

  previous: () => {
    const { results, currentIndex } = get();
    if (results.length === 0) return -1;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
    set({ currentIndex: prevIndex });
    return prevIndex;
  },

  clear: () => {
    set({
      query: '',
      results: [],
      currentIndex: -1,
      status: 'idle',
      errorMessage: null,
      totalCount: 0,
    });
  },
}));
