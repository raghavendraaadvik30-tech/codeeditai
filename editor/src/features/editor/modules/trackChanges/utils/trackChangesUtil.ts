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
 * Checks whether a DOM node or caret is strictly contained inside an element matching the selector (e.g. 'ins[data-tc]', 'del[data-tc]').
 */
export function isInsideTcElement(node: Node | null, selector: string = "[data-tc]"): HTMLElement | null {
  if (!node) return null;
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.parentElement?.closest(selector) as HTMLElement | null) ?? null;
  }
  if (node instanceof Element) {
    return (node.closest(selector) as HTMLElement | null) ?? null;
  }
  return null;
}

/**
 * Helper to locate the closest tracked change DOM node relative to a start container and offset.
 */
export function getClosestTcElement(node: Node | null, offset: number, selector: string = "[data-tc]"): HTMLElement | null {
  if (!node) return null;
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.parentElement?.closest(selector) as HTMLElement | null) ?? null;
  }
  if (node instanceof Element) {
    if (node.matches(selector)) return node as HTMLElement;
    const parentMatch = node.closest(selector);
    if (parentMatch) return parentMatch as HTMLElement;
    if (node.childNodes && offset >= 0 && offset < node.childNodes.length) {
      const child = node.childNodes[offset];
      if (child instanceof Element && child.matches(selector)) return child as HTMLElement;
      if (child.nodeType === Node.TEXT_NODE) return (child.parentElement?.closest(selector) as HTMLElement | null) ?? null;
    }
  }
  return null;
}

/**
 * Helper to generate a random unique ID with prefix.
 */
export function generateChangeId(prefix = "tc"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

