/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Links Repository
 * Description:
 * Data access and local caching abstraction layer mapping raw DTOs
 * to strongly-typed internal LinkModel, BookmarkItem, and CitationItem domain entities.
 * --------------------------------------------------------
 */

import { linksApi } from '../api';
import type {
  LinkModel,
  LinkDTO,
  LinkType,
  CreateLinkPayload,
  UpdateLinkPayload,
  BookmarkItem,
  CitationItem,
  LinkHistoryItem,
} from '../types';
import { STORAGE_KEYS } from '../constants';

export class LinksRepository {
  private mapDtoToModel(dto: LinkDTO): LinkModel {
    return {
      id: dto.link_id,
      type: (dto.link_type as LinkType) || 'external',
      displayText: dto.display_text,
      target: dto.target_uri,
      protocol: dto.protocol_scheme,
      tooltip: dto.tooltip_text,
      openInNewTab: dto.open_in_new_tab ?? true,
      pageNumber: dto.page_num,
      metadata: dto.extra_data,
      createdAt: dto.created_timestamp,
      updatedAt: dto.updated_timestamp,
    };
  }

  async getAllLinks(documentId?: string): Promise<LinkModel[]> {
    const dtos = await linksApi.fetchLinks(documentId);
    return dtos.map((dto) => this.mapDtoToModel(dto));
  }

  async createLink(payload: CreateLinkPayload): Promise<LinkModel> {
    const dto = await linksApi.createLink(payload);
    return this.mapDtoToModel(dto);
  }

  async updateLink(id: string, payload: UpdateLinkPayload): Promise<LinkModel> {
    const dto = await linksApi.updateLink(id, payload);
    return this.mapDtoToModel(dto);
  }

  async deleteLink(id: string): Promise<void> {
    await linksApi.deleteLink(id);
  }

  /* ============================================================
     Local Bookmark Persistence
  ============================================================ */

  loadSavedBookmarks(): BookmarkItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (!raw) return [];
      return JSON.parse(raw) as BookmarkItem[];
    } catch {
      return [];
    }
  }

  saveBookmarks(bookmarks: BookmarkItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }

  /* ============================================================
     Local Citation Persistence
  ============================================================ */

  loadSavedCitations(): CitationItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CITATIONS);
      if (!raw) return [];
      return JSON.parse(raw) as CitationItem[];
    } catch {
      return [];
    }
  }

  saveCitations(citations: CitationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CITATIONS, JSON.stringify(citations));
    } catch {
      // ignore
    }
  }

  /* ============================================================
     Local Links History Persistence
  ============================================================ */

  loadSavedHistory(): LinkHistoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LINKS_HISTORY);
      if (!raw) return [];
      return JSON.parse(raw) as LinkHistoryItem[];
    } catch {
      return [];
    }
  }

  saveHistory(history: LinkHistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LINKS_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }

  addHistoryItem(item: Omit<LinkHistoryItem, 'id' | 'createdAt'>): LinkHistoryItem {
    const newItem: LinkHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const current = this.loadSavedHistory();
    const updated = [newItem, ...current];
    this.saveHistory(updated);
    return newItem;
  }

  removeHistoryItem(id: string): void {
    const current = this.loadSavedHistory();
    const updated = current.filter((h) => h.id !== id);
    this.saveHistory(updated);
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LINKS_HISTORY);
    } catch {
      // ignore
    }
  }
}

export const linksRepository = new LinksRepository();

