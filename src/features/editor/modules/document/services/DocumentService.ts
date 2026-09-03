/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Business Logic Service
 * Description:
 * Domain service handling document business rules, schema validations,
 * page count estimations, and repository lifecycle delegation.
 * --------------------------------------------------------
 */

import { documentRepository, DocumentRepository } from '../repository';
import type { DocumentModel, CreateDocumentPayload, UpdateDocumentPayload } from '../types';
import { CreateDocumentSchema, UpdateDocumentSchema } from '../schemas';

export class DocumentService {
  constructor(private repo: DocumentRepository = documentRepository) {}

  async listDocuments(): Promise<DocumentModel[]> {
    return await this.repo.getAll();
  }

  async getDocumentDetails(id: string): Promise<DocumentModel> {
    if (!id || !id.trim()) {
      throw new Error('Document ID is required');
    }
    return await this.repo.getById(id);
  }

  async createNewDocument(payload: CreateDocumentPayload): Promise<DocumentModel> {
    const validationResult = CreateDocumentSchema.safeParse(payload);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(', ');
      throw new Error(`Validation Error: ${errorMsg}`);
    }

    return await this.repo.create({
      ...payload,
      content: payload.content.trim(),
    });
  }

  async updateDocumentContent(id: string, payload: UpdateDocumentPayload): Promise<DocumentModel> {
    const validationResult = UpdateDocumentSchema.safeParse(payload);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(', ');
      throw new Error(`Validation Error: ${errorMsg}`);
    }

    return await this.repo.update(id, payload);
  }

  async submitForReview(id: string): Promise<DocumentModel> {
    const doc = await this.getDocumentDetails(id);
    if (doc.status !== 'DRAFT') {
      throw new Error(`Only draft documents can be submitted for review. Current status: ${doc.status}`);
    }
    return await this.repo.update(id, { status: 'IN_REVIEW' });
  }

  async deleteDocument(id: string): Promise<void> {
    await this.repo.remove(id);
  }
}

export const documentService = new DocumentService();
