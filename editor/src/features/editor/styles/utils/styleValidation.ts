import type { StyleToken } from "../types/styles.types";

export function validateStyle(
  style: StyleToken,
): boolean {
  if (!style.name.trim()) {
    return false;
  }

  if (!style.font.trim()) {
    return false;
  }

  if (style.size < 6 || style.size > 96) {
    return false;
  }

  if (style.weight < 100 || style.weight > 900) {
    return false;
  }

  return true;
}