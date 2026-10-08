import type {
  StyleToken,
} from "../../types/styles.types";

interface Props {
  token: StyleToken;
}

export function StylePreview({
  token,
}: Props) {
  return (
    <div
      className="
        rounded-lg
        border
        border-border
        p-4
      "
    >
      <p
        style={{
          fontFamily: token.family,
          fontSize: `${Math.min(
            token.size,
            32,
          )}px`,
          fontWeight: token.weight,
          fontStyle: token.italic
            ? "italic"
            : "normal",
          textDecoration:
            token.underline
              ? "underline"
              : "none",
          textAlign:
            token.alignment,
          lineHeight:
            token.lineHeight,
        }}
      >
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  );
}