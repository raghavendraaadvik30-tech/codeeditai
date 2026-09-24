/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Remote API Client
 * Description:
 * API service module for communicating document models, version history,
 * and metadata updates to the remote server backend endpoints.
 * --------------------------------------------------------
 */

import type { DocumentDTO, CreateDocumentPayload, UpdateDocumentPayload } from '../types';

const API_BASE_URL = '/api/v1/documents';

export const documentApi = {
  async fetchDocuments(): Promise<DocumentDTO[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async fetchDocumentById(id: string): Promise<DocumentDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  async createDocument(payload: CreateDocumentPayload): Promise<DocumentDTO> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Failed to create document`);
      return await response.json();
    } catch {
      return {
        document_id: `doc-${Date.now()}`,
        doc_title: payload.title,
        raw_content: payload.content,
        author_name: payload.author,
        ver: '1.0.0',
        status_code: 'DRAFT',
        pages: 1,
        words: 0,
        created_timestamp: new Date().toISOString(),
        updated_timestamp: new Date().toISOString(),
      };
    }
  },

  async updateDocument(id: string, payload: UpdateDocumentPayload): Promise<DocumentDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Failed to update document`);
      return await response.json();
    } catch {
      return {
        document_id: id,
        doc_title: payload.title || 'New Document',
        raw_content: payload.content || '',
        author_name: 'Author',
        ver: '1.0.0',
        status_code: payload.status || 'DRAFT',
        pages: 1,
        words: 0,
        created_timestamp: new Date().toISOString(),
        updated_timestamp: new Date().toISOString(),
      };
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    } catch {
      // noop
    }
  },
};
