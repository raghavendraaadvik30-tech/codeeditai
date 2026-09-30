// import type { StyleToken } from "../types/styles.types";

// export function validateStyle(
//   style: StyleToken,
// ): boolean {
//   if (!style.name.trim()) {
//     return false;
//   }

//   if (!style.font.trim()) {
//     return false;
//   }

//   if (style.size < 6 || style.size > 96) {
//     return false;
//   }

//   if (style.weight < 100 || style.weight > 900) {
//     return false;
//   }

//   return true;
// }

import type {
  StyleOverride,
  StyleToken,
} from "../types/styles.types";

export function validateStyleUpdate(
  update: StyleOverride,
): boolean {
  if (
    update.size !== undefined &&
    (update.size < 1 || update.size > 200)
  ) {
    return false;
  }

  if (
    update.weight !== undefined &&
    (update.weight < 100 ||
      update.weight > 900)
  ) {
    return false;
  }

  if (
    update.lineHeight !== undefined &&
    update.lineHeight <= 0
  ) {
    return false;
  }

  return true;
}

export function mergeStyle(
  style: StyleToken,
  update: StyleOverride,
): StyleToken {
  return {
    ...style,
    ...update,
  };
}