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
