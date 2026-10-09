// import type {
//   ModifyStyleValues,
//   StyleToken,
// } from "../types/styles.types";

// /**
//  * Converts a style token into a CSS style string.
//  */
// export function buildStyleString(
//   style: StyleToken,
// ): string {
//   return [
//     `font-family:${style.font},Calibri,sans-serif`,
//     `font-size:${style.size}pt`,
//     `font-weight:${style.weight}`,

//     style.italic
//       ? "font-style:italic"
//       : "",

//     style.underline
//       ? "text-decoration:underline"
//       : "",

//     style.color === "primary"
//       ? "color:hsl(var(--primary))"
//       : style.color
//         ? `color:${style.color}`
//         : "",

//     style.align
//       ? `text-align:${style.align}`
//       : "",

//     style.lineHeight
//       ? `line-height:${style.lineHeight}`
//       : "",

//     style.spaceBefore !== undefined
//       ? `margin-top:${style.spaceBefore}pt`
//       : "",

//     style.spaceAfter !== undefined
//       ? `margin-bottom:${style.spaceAfter}pt`
//       : "",

//     style.leftIndent !== undefined
//       ? `padding-left:${style.leftIndent}pt`
//       : "",

//     style.rightIndent !== undefined
//       ? `padding-right:${style.rightIndent}pt`
//       : "",
//   ]
//     .filter(Boolean)
//     .join(";");
// }

// /**
//  * Merges a style with its override.
//  */
// export function mergeStyle(
//   style: StyleToken,
//   override?: Partial<StyleToken>,
// ): StyleToken {
//   return {
//     ...style,
//     ...(override ?? {}),
//   };
// }

// /**
//  * Converts a StyleToken into values used
//  * by the Modify Style form.
//  */
// export function styleToModifyValues(
//   style: StyleToken,
// ): ModifyStyleValues {
//   return {
//     font: style.font,
//     size: style.size,
//     weight: style.weight,

//     bold: style.weight >= 700,
//     italic: !!style.italic,
//     underline: !!style.underline,

//     align: style.align ?? "left",
//     lineHeight: style.lineHeight ?? 1.15,

//     leftIndent: style.leftIndent ?? 0,
//     rightIndent: style.rightIndent ?? 0,

//     specialIndent:
//       style.specialIndent ?? "none",

//     specialIndentBy:
//       style.specialIndentBy ?? 0,

//     spaceBefore:
//       style.spaceBefore ?? 0,

//     spaceAfter:
//       style.spaceAfter ?? 0,

//     lineSpacingType:
//       style.lineSpacingType ?? "single",

//     lineSpacingAt:
//       style.lineSpacingAt ?? 0,
//   };
// }

// /**
//  * Validates a style token before saving it.
//  */
// export function validateStyle(
//   style: StyleToken,
// ): boolean {
//   if (!style.name.trim()) {
//     return false;
//   }

//   if (!style.font.trim()) {
//     return false;
//   }

//   if (!Number.isFinite(style.size)) {
//     return false;
//   }

//   if (style.size <= 0) {
//     return false;
//   }

//   if (!Number.isFinite(style.weight)) {
//     return false;
//   }

//   if (style.weight < 100 || style.weight > 900) {
//     return false;
//   }

//   if (
//     style.lineHeight !== undefined &&
//     style.lineHeight <= 0
//   ) {
//     return false;
//   }

//   if (
//     style.leftIndent !== undefined &&
//     style.leftIndent < 0
//   ) {
//     return false;
//   }

//   if (
//     style.rightIndent !== undefined &&
//     style.rightIndent < 0
//   ) {
//     return false;
//   }

//   if (
//     style.spaceBefore !== undefined &&
//     style.spaceBefore < 0
//   ) {
//     return false;
//   }

//   if (
//     style.spaceAfter !== undefined &&
//     style.spaceAfter < 0
//   ) {
//     return false;
//   }

//   return true;
// }

// export function previewFontSize(
//   size: number,
// ): number {
//   return Math.max(
//     10,
//     Math.min(size * 0.68, 16),
//   );
// }

// export function getPreviewFontSize(
//   size: number,
// ): number {
//   return Math.min(
//     size * 1.1,
//     26,
//   );
// }




import type {
  StyleToken,
} from "../types/styles.types";

export function styleToCss(
  style: StyleToken,
): React.CSSProperties {
  return {
    fontFamily: style.family,
    fontSize: `${style.size}pt`,
    fontWeight: style.weight,
    fontStyle: style.italic
      ? "italic"
      : "normal",
    textDecoration: style.underline
      ? "underline"
      : "none",
    textAlign: style.alignment,
    lineHeight: style.lineHeight,
    marginTop:
      style.spaceBefore !== undefined
        ? `${style.spaceBefore}pt`
        : undefined,
    marginBottom:
      style.spaceAfter !== undefined
        ? `${style.spaceAfter}pt`
        : undefined,
  };
}

export function styleLabel(
  style: StyleToken,
) {
  return `${style.family} ${style.size}pt`;
}
