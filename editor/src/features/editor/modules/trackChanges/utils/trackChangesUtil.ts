/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Track Changes Utility Helpers
 * Description:
 * Helper functions for DOM element traversal, selection management,
 * and human-readable label generation.
 * --------------------------------------------------------
 */

import type { TrackChangeType } from "../types";

/**
 * Derives a human-readable label for a tracked change based on context and content.
 * e.g., "Paragraph edited", "Text deleted", "Table modified", "Inserted text"
 */
export function getHumanReadableChangeLabel(
  type: TrackChangeType,
  originalText?: string,
  newText?: string,
  contextTag?: string
): string {
  const isTable = contextTag?.toLowerCase() === "table" || contextTag?.toLowerCase() === "td" || contextTag?.toLowerCase() === "th";
  const isHeading = contextTag?.startsWith("H") || contextTag?.startsWith("h");

  if (isTable) {
    return "Table modified";
  }

  if (isHeading) {
    if (type === "insert") return "Heading inserted";
    if (type === "delete") return "Heading deleted";
    return "Heading updated";
  }

  if (type === "insert") {
    const text = (newText || "").trim();
    if (text.length > 40) return "Paragraph inserted";
    if (text.length > 15) return "Sentence inserted";
    return "Text inserted";
  }

  if (type === "delete") {
    const text = (originalText || "").trim();
    if (text.length > 40) return "Paragraph deleted";
    if (text.length > 15) return "Sentence deleted";
    return "Text deleted";
  }

  if (type === "edit") {
    const orig = (originalText || "").trim();
    const next = (newText || "").trim();
    if (orig.length > 40 || next.length > 40) return "Paragraph edited";
    return "Text edited";
  }

  return "Content modified";
}

/**
 * Helper to locate the closest tracked change DOM node relative to a start container and offset.
 */
export function getClosestTcElement(node: Node, offset: number, selector: string): HTMLElement | null {
  let target: Node | null = node;
  if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
    const idx = Math.max(0, Math.min(offset, node.childNodes.length - 1));
    target = node.childNodes[idx];
  }
  if (target && target.nodeType === Node.TEXT_NODE) {
    target = target.parentNode;
  }
  return target instanceof Element ? (target.closest(selector) as HTMLElement | null) : null;
}

/**
 * Helper to generate a random unique ID with prefix.
 */
export function generateChangeId(prefix = "tc"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
