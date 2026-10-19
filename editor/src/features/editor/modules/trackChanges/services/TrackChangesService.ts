/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Business Logic & Workflow Service
 * Description:
 * Domain service handling tracked change validations, comment appending,
 * status transitions (accepted/rejected), and diff summaries.
 * --------------------------------------------------------
 */

import { trackChangesRepository, TrackChangesRepository } from "../repository";
import type {
  TrackedChange,
  Comment,
  CreateTrackedChangePayload,
} from "../types";
import { CreateTrackedChangePayloadSchema } from "../schemas";
import { getHumanReadableChangeLabel } from "../utils";

export class TrackChangesService {
  constructor(private repo: TrackChangesRepository = trackChangesRepository) { }

  async getTrackedChanges(docId: string): Promise<TrackedChange[]> {
    if (!docId) return [];
    return await this.repo.getChangesForDoc(docId);
  }

  async recordNewChange(docId: string, payload: CreateTrackedChangePayload): Promise<TrackedChange> {
    const validated = CreateTrackedChangePayloadSchema.safeParse(payload);
    if (!validated.success) {
      const err = validated.error.issues.map((i) => i.message).join(", ");
      throw new Error(`Validation Error: ${err}`);
    }

    const readableLabel = payload.label || getHumanReadableChangeLabel(payload.type, payload.originalText, payload.newText);

    return await this.repo.create(docId, {
      ...payload,
      label: readableLabel,
    });
  }

  async addComment(_docId: string, _changeId: string, author: string, text: string): Promise<Comment> {
    const newComment: Comment = {
      id: `c-${Math.random().toString(36).slice(2, 9)}`,
      author,
      text: text.trim(),
      timestamp: Date.now(),
    };



    return newComment;
  }

  calculateStats(changes: TrackedChange[]) {
    const pending = changes.filter((c) => c.status === "pending");
    const accepted = changes.filter((c) => c.status === "accepted");
    const rejected = changes.filter((c) => c.status === "rejected");

    const insertions = pending.filter((c) => c.type === "insert").length;
    const deletions = pending.filter((c) => c.type === "delete").length;
    const edits = pending.filter((c) => c.type === "edit").length;

    return {
      total: changes.length,
      pendingCount: pending.length,
      acceptedCount: accepted.length,
      rejectedCount: rejected.length,
      insertions,
      deletions,
      edits,
    };
  }

  saveChanges(docId: string, changes: TrackedChange[]): void {
    this.repo.saveToStorage(docId, changes);
  }
}

export const trackChangesService = new TrackChangesService();
