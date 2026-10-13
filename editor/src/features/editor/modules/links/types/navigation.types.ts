/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Types for Document Navigation Pane (Headings, Pages, Results, Bookmarks)
 * --------------------------------------------------------
 */

export interface HeadingNode {
  id: string;
  title: string;
  level: number;
  pageNumber: number;
  element: HTMLElement;
  children: HeadingNode[];
  parentId?: string;
  hasMatch?: boolean;
}

export interface SearchMatchItem {
  id: string;
  matchText: string;
  snippetPre: string;
  snippetMatch: string;
  snippetPost: string;
  pageNumber: number;
  pageLabel?: string;
  element?: HTMLElement;
  range?: any; // Word.Range in Office.js context
  index: number;
}

export type SearchResultItem = SearchMatchItem;

export interface PageThumbnailItem {
  pageNumber: number;
  pageLabel: string;
  pageId: string;
  snippet: string;
  html?: string;
  element?: HTMLElement;
  isActive: boolean;
}

export type NavigationSubTab = 'headings' | 'pages' | 'results' | 'bookmarks';
export type SearchStatus = 'idle' | 'searching' | 'done' | 'error';

export interface SearchOptions {
  matchCase: boolean;
  matchWholeWord: boolean;
}

