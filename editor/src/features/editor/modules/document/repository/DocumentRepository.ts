/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Data Repository
 * Description:
 * Data access and transformation abstraction layer mapping raw DTOs
 * to strongly-typed internal DocumentModel domain entities.
 * --------------------------------------------------------
 */

import { documentApi } from '../api';
import type { DocumentModel, DocumentDTO, CreateDocumentPayload, UpdateDocumentPayload } from '../types';
import { DEFAULT_DOCUMENT } from '../constants';

export class DocumentRepository {
  private mapDtoToModel(dto: DocumentDTO): DocumentModel {
    return {
      id: dto.document_id,
      title: dto.doc_title,
      content: dto.raw_content,
      author: dto.author_name,
      version: dto.ver,
      status: (dto.status_code as DocumentModel['status']) || 'DRAFT',
      pageCount: dto.pages,
      wordCount: dto.words,
      createdAt: dto.created_timestamp,
      updatedAt: dto.updated_timestamp,
    };
  }

  async getAll(): Promise<DocumentModel[]> {
    const dtos = await documentApi.fetchDocuments();
    if (!dtos.length) {
      return [DEFAULT_DOCUMENT];
    }
    return dtos.map((dto) => this.mapDtoToModel(dto));
  }

  async getById(id: string): Promise<DocumentModel> {
    const dto = await documentApi.fetchDocumentById(id);
    if (!dto) {
      return { ...DEFAULT_DOCUMENT, id };
    }
    return this.mapDtoToModel(dto);
  }

  async create(payload: CreateDocumentPayload): Promise<DocumentModel> {
    const dto = await documentApi.createDocument(payload);
    return this.mapDtoToModel(dto);
  }

  async update(id: string, payload: UpdateDocumentPayload): Promise<DocumentModel> {
    const dto = await documentApi.updateDocument(id, payload);
    return this.mapDtoToModel(dto);
  }

  async remove(id: string): Promise<void> {
    await documentApi.deleteDocument(id);
  }
}

export const documentRepository = new DocumentRepository();
