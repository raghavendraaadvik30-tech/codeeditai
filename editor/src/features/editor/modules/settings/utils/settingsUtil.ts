/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings Utility Functions
 * Description:
 * Helper utilities for formatting and calculating editor settings.
 * --------------------------------------------------------
 */

import type { EditorSettings } from "../types";

export function getPageDimensions(size: EditorSettings["pageSize"], orientation: EditorSettings["pageOrientation"]) {
  const isLandscape = orientation === "landscape";
  switch (size) {
    case "Letter":
      return isLandscape ? { width: "1056px", height: "816px" } : { width: "816px", height: "1056px" };
    case "Legal":
      return isLandscape ? { width: "1344px", height: "816px" } : { width: "816px", height: "1344px" };
    case "A4":
    default:
      return isLandscape ? { width: "1122px", height: "794px" } : { width: "794px", height: "1122px" };
  }
}

export function formatAutoSaveInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}
