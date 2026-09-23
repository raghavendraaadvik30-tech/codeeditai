/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Track Changes Data Repository
 * Description:
 * Data access and transformation abstraction layer mapping raw DTOs
 * to strongly-typed internal TrackedChange domain entities.
 * --------------------------------------------------------
 */

import { trackChangesApi } from "../api";
import type {
  TrackedChange,
  TrackedChangeDTO,
  CreateTrackedChangePayload,
  UpdateTrackedChangePayload,
} from "../types";

export class TrackChangesRepository {
  private mapDtoToModel(dto: TrackedChangeDTO): TrackedChange {
    return {
      id: dto.change_id,
      author: dto.author_name,
      timestamp: dto.timestamp_unix,
      type: dto.change_type,
      originalText: dto.original_content,
      newText: dto.new_content,
      status: dto.review_status,
      comments: dto.comments_list.map((c) => ({
        id: c.comment_id,
        author: c.author_name,
        text: c.comment_text,
        timestamp: c.timestamp_unix,
      })),
      label: dto.readable_label,
    };
  }

  async getChangesForDoc(docId: string): Promise<TrackedChange[]> {
    const dtos = await trackChangesApi.fetchTrackedChanges(docId);
    return dtos.map((dto) => this.mapDtoToModel(dto));
  }

  async create(docId: string, payload: CreateTrackedChangePayload): Promise<TrackedChange> {
    const dto = await trackChangesApi.createTrackedChange(docId, payload);
    return this.mapDtoToModel(dto);
  }

  async update(docId: string, changeId: string, payload: UpdateTrackedChangePayload): Promise<TrackedChange | null> {
    const dto = await trackChangesApi.updateTrackedChange(docId, changeId, payload);
    return dto ? this.mapDtoToModel(dto) : null;
  }

  async remove(changeId: string): Promise<void> {
    await trackChangesApi.deleteTrackedChange(changeId);
  }

  saveToStorage(docId: string, changes: TrackedChange[]): void {
    trackChangesApi.persistLocalChanges(docId, changes);
  }
}

export const trackChangesRepository = new TrackChangesRepository();
