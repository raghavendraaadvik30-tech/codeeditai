/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Type Definitions
 * Description:
 * Data models, DTO interfaces, and request payload contracts
 * defining type safety rules for document handling.
 * --------------------------------------------------------
 */

export interface DocumentModel {
  id: string;
  title: string;
  content: string;
  author: string;
  version: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
  pageCount: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDTO {
  document_id: string;
  doc_title: string;
  raw_content: string;
  author_name: string;
  ver: string;
  status_code: string;
  pages: number;
  words: number;
  created_timestamp: string;
  updated_timestamp: string;
}

export interface CreateDocumentPayload {
  title: string;
  content: string;
  author: string;
}

export interface UpdateDocumentPayload {
  title?: string;
  content?: string;
  status?: DocumentModel['status'];
}
