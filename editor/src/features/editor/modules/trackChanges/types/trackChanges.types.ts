/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Domain Types & Interface Definitions
 * Description:
 * Strongly-typed domain models and interface contracts for track changes,
 * revision records,visual markups, diff tokens, and context state.
 * --------------------------------------------------------
 */

export type TrackChangeType = "insert" | "delete" | "edit";

export type TrackChangeStatus = "pending" | "accepted" | "rejected";

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface TrackedChange {
  id: string;
  author: string;
  timestamp: number;
  type: TrackChangeType;
  originalText: string;
  newText: string;
  status: TrackChangeStatus;
  
  label?: string; // Human-readable change label (e.g., "Paragraph edited", "Text deleted", "Table modified")
  pageId?: string;
  selector?: string;
}

export interface TrackedChangeDTO {
  change_id: string;
  doc_id?: string;
  author_name: string;
  timestamp_unix: number;
  change_type: "insert" | "delete" | "edit";
  original_content: string;
  new_content: string;
  review_status: "pending" | "accepted" | "rejected";
  readable_label?: string;
}

export interface CreateTrackedChangePayload {
  author: string;
  type: TrackChangeType;
  originalText?: string;
  newText?: string;
  pageId?: string;
  label?: string;
}

export interface UpdateTrackedChangePayload {
  status?: TrackChangeStatus;
  label?: string;
}

export interface DiffToken {
  type: "added" | "removed" | "common";
  value: string;
}

export interface TrackChangesState {
  trackChanges: boolean;
  showMarkup: boolean;
  trackedChanges: TrackedChange[];
  activeChangeId: string | null;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

export interface TrackChangesContextType {
  trackChanges: boolean;
  setTrackChanges: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleTrackChanges: () => void;

  showMarkup: boolean;
  setShowMarkup: (show: boolean | ((prev: boolean) => boolean)) => void;

  trackedChanges: TrackedChange[];
  pendingChanges: number;
  activeChangeId: string | null;
  setActiveChangeId: (id: string | null) => void;

  addTrackedChange: (change: TrackedChange) => void;
  addCommentToChange: (changeId: string, text: string) => void;
  acceptChange: (changeId: string) => void;
  rejectChange: (changeId: string) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  prevChange: () => void;
  nextChange: () => void;

  // DOM event handlers
  handleBeforeInput: (e: InputEvent, pageId: string) => void;
  handleKeyDown: (e: KeyboardEvent, pageId: string) => void;
  handleInput: (e: Event, pageId: string) => void;
  handleClick: (e: MouseEvent, pageId: string) => void;
  syncTrackedChangesFromDOM: () => void;
}
