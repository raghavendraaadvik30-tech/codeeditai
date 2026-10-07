/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Constants & Defaults
 * Description:
 * Constant keys, default state objects, theme colors, and type labels
 * for the Track Changes module.
 * --------------------------------------------------------
 */

import type { TrackChangeType } from "../types";

export const TRACK_CHANGES_STORAGE_KEY = "parexel.trackChanges.v2";
export const SHOW_MARKUP_STORAGE_KEY = "parexel.showMarkup.v2";
export const TRACKED_CHANGES_PREFIX = "parexel.trackedChanges.v2";

export const DEFAULT_AUTHOR = "Current User";

export const CHANGE_TYPE_LABELS: Record<TrackChangeType, string> = {
  insert: "Insertion",
  delete: "Deletion",
  edit: "Edit",
};

export const CHANGE_TYPE_COLORS: Record<TrackChangeType, { bg: string; text: string; border: string }> = {
  insert: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-800",
  },
  delete: {
    bg: "bg-destructive/10 dark:bg-rose-950/40",
    text: "text-destructive dark:text-rose-400",
    border: "border-rose-300 dark:border-rose-800",
  },
  edit: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-300 dark:border-amber-800",
  },
};

export const HUMAN_READABLE_ACTION_LABELS = {
  PARAGRAPH_EDITED: "Paragraph edited",
  TEXT_DELETED: "Text deleted",
  TEXT_INSERTED: "Text inserted",
  TABLE_MODIFIED: "Table modified",
  HEADING_UPDATED: "Heading updated",
  LIST_ITEM_MODIFIED: "List item modified",
  STYLE_APPLIED: "Formatting updated",
} as const;
