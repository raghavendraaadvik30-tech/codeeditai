/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Constants & Enums
 * Description:
 * Global configuration constants, paper size formats,
 * pagination defaults, and status mappings for the Document module.
 * --------------------------------------------------------
 */

export const DEFAULT_PAGE_SIZE = 'A4';
export const DEFAULT_PAGE_ORIENTATION = 'portrait';
export const WORDS_PER_PAGE_AVERAGE = 500;

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
}

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'Draft',
  [DocumentStatus.IN_REVIEW]: 'In Review',
  [DocumentStatus.APPROVED]: 'Approved',
  [DocumentStatus.PUBLISHED]: 'Published',
};

export const DEFAULT_DOCUMENT = {
  id: "doc-1",
  title: "Untitled Document",
  content: "",
  author: "Author",
  version: "1.0.0",
  status: DocumentStatus.DRAFT,
  pageCount: 1,
  wordCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
