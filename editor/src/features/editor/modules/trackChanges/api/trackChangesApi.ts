/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Remote API Client & Persistence Adapter
 * Description:
 * API service communicating tracked change records, revisions, and comments
 * with remote backend endpoints, providing localStorage persistence fallback.
 * --------------------------------------------------------
 */

import type {
  TrackedChange,
  TrackedChangeDTO,
  CreateTrackedChangePayload,
  UpdateTrackedChangePayload,
} from "../types";
import { TRACKED_CHANGES_PREFIX, DEFAULT_AUTHOR } from "../constants";

const API_BASE_URL = "/api/v1/track-changes";

export const trackChangesApi = {
  /**
   * Fetches all tracked changes for a specific document ID.
   */
  async fetchTrackedChanges(docId: string): Promise<TrackedChangeDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}?docId=${encodeURIComponent(docId)}`);
      if (!response.ok) throw new Error("API request failed");
      return await response.json();
    } catch {
      // LocalStorage persistence fallback
      try {
        const key = `${TRACKED_CHANGES_PREFIX}.${docId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const list: TrackedChange[] = JSON.parse(stored);
          return list.map((c) => ({
            change_id: c.id,
            doc_id: docId,
            author_name: c.author,
            timestamp_unix: c.timestamp,
            change_type: c.type,
            original_content: c.originalText,
            new_content: c.newText,
            review_status: c.status,
            comments_list: c.comments.map((cm) => ({
              comment_id: cm.id,
              author_name: cm.author,
              comment_text: cm.text,
              timestamp_unix: cm.timestamp,
            })),
            readable_label: c.label,
          }));
        }
      } catch {
        // ignore
      }
      return [];
    }
  },

  /**
   * Saves or creates a tracked change record.
   */
  async createTrackedChange(docId: string, payload: CreateTrackedChangePayload): Promise<TrackedChangeDTO> {
    const id = `tc-${Math.random().toString(36).slice(2, 9)}`;
    const now = Date.now();
    const dto: TrackedChangeDTO = {
      change_id: id,
      doc_id: docId,
      author_name: payload.author || DEFAULT_AUTHOR,
      timestamp_unix: now,
      change_type: payload.type,
      original_content: payload.originalText || "",
      new_content: payload.newText || "",
      review_status: "pending",
      comments_list: [],
      readable_label: payload.label,
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, docId }),
      });
      if (!response.ok) throw new Error("Remote save failed");
      return await response.json();
    } catch {
      return dto;
    }
  },

  /**
   * Updates an existing change record status or comments.
   */
  async updateTrackedChange(
    docId: string,
    changeId: string,
    payload: UpdateTrackedChangePayload
  ): Promise<TrackedChangeDTO | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${changeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, docId }),
      });
      if (!response.ok) throw new Error("Remote update failed");
      return await response.json();
    } catch {
      return null;
    }
  },

  /**
   * Deletes or clears a tracked change.
   */
  async deleteTrackedChange(changeId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/${changeId}`, { method: "DELETE" });
    } catch {
      // noop
    }
  },

  /**
   * Syncs full tracked changes array into local storage for the document.
   */
  persistLocalChanges(docId: string, changes: TrackedChange[]): void {
    try {
      const key = `${TRACKED_CHANGES_PREFIX}.${docId}`;
      localStorage.setItem(key, JSON.stringify(changes));
    } catch (e) {
      console.error("Failed to persist tracked changes to localStorage", e);
    }
  },
};
