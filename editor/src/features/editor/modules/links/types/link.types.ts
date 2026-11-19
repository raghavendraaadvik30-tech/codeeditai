/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Links Type Definitions
 * Description:
 * Data models, DTO interfaces, and request payload contracts
 * defining type safety rules for hyperlinks, bookmarks, cross references,
 * reference validation, citations, and email links.
 * --------------------------------------------------------
 */

export type LinkType =
  | 'external'
  | 'internal'
  | 'bookmark'
  | 'cross_ref'
  | 'email'
  | 'citation';

export type CrossReferenceTarget =
  | 'heading'
  | 'figure'
  | 'table'
  | 'bookmark';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationIssueType =
  | 'broken_internal'
  | 'empty_target'
  | 'invalid_url'
  | 'insecure_http'
  | 'typo'
  | 'unreachable'
  | 'missing_bookmark';

export interface LinkModel {
  id: string;
  type: LinkType;
  displayText: string;
  target: string;
  protocol?: string;
  tooltip?: string;
  openInNewTab?: boolean;
  pageNumber?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LinkDTO {
  link_id: string;
  link_type: string;
  display_text: string;
  target_uri: string;
  protocol_scheme?: string;
  tooltip_text?: string;
  open_in_new_tab?: boolean;
  page_num?: number;
  extra_data?: Record<string, unknown>;
  created_timestamp: string;
  updated_timestamp: string;
}

export interface CreateLinkPayload {
  type: LinkType;
  displayText: string;
  target: string;
  protocol?: string;
  tooltip?: string;
  openInNewTab?: boolean;
}

export interface UpdateLinkPayload {
  displayText?: string;
  target?: string;
  protocol?: string;
  tooltip?: string;
  openInNewTab?: boolean;
}

export interface BookmarkItem {
  id: string;
  name: string;
  text?: string;
  pageNumber?: number;
  createdAt: string;
  elementId?: string;
}

export interface CrossReferenceItem {
  id: string;
  targetId: string;
  // "custom" marks references to arbitrary anchors (see HyperlinkService).
  targetType: CrossReferenceTarget | 'custom';
  label: string;
  targetText: string;
  pageNumber?: number;
}

export interface CrossReferenceTargetItem {
  id: string;
  type: CrossReferenceTarget;
  title: string;
  pageNumber?: number;
  element?: HTMLElement;
}

export interface ValidationIssue {
  id: string;
  type: ValidationIssueType;
  severity: ValidationSeverity;
  message: string;
  target: string;
  elementText: string;
  pageNumber?: number;
  fixSuggestion?: string;
  element?: HTMLAnchorElement | HTMLElement;
}

export interface EmailLinkData {
  to: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
  displayText?: string;
}

export interface CitationItem {
  id: string;
  key: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
}

export interface BrokenLinksReportData {
  totalLinks: number;
  validLinks: number;
  issues: ValidationIssue[];
  scannedAt: string;
}

export type LinkHistoryType =
  | 'Web URL'
  | 'Email'
  | 'Document'
  | 'Cross Reference'
  | 'Bookmark';

export interface LinkHistoryItem {
  id: string;
  type: LinkHistoryType;
  displayText: string;
  target: string;
  createdAt: string;
  createdBy: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

