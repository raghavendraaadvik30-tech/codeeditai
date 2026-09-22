// import type {
//   ModifyStyleValues,
//   StyleToken,
// } from "../../types/styles.types";

// import {
//   getPreviewFontSize,
// } from "../../utils/styleUtil";

// interface Props {
//   token: StyleToken;
//   values: ModifyStyleValues;
// }

// export function StylePreview({
//   token,
//   values,
// }: Props) {
//   const fontSize =
//     getPreviewFontSize(
//       values.size,
//     );

//   return (
//     <div className="
//       rounded-lg
//       border
//       border-border
//       bg-popover
//       min-h-[72px]
//       flex
//       items-center
//       px-4
//       py-3
//       overflow-hidden
//     ">
//       <p
//         style={{
//           fontFamily:
//             `${values.font},Calibri,sans-serif`,

//           fontSize:
//             `${fontSize}px`,

//           fontWeight:
//             values.bold
//               ? 700
//               : values.weight,

//           fontStyle:
//             values.italic
//               ? "italic"
//               : "normal",

//           textDecoration:
//             values.underline
//               ? "underline"
//               : "none",

//           textAlign:
//             values.align,

//           lineHeight:
//             values.lineHeight,

//           color:
//             token.color === "primary"
//               ? "hsl(var(--primary))"
//               : "#1a1a2e",

//           paddingLeft:
//             `${values.leftIndent * 0.4}px`,

//           paddingRight:
//             `${values.rightIndent * 0.4}px`,

//           textIndent:
//             values.specialIndent ===
//             "firstLine"
//               ? `${values.specialIndentBy * 0.4}px`
//               : values.specialIndent ===
//                   "hanging"
//                 ? `-${values.specialIndentBy * 0.4}px`
//                 : undefined,
//         }}
//         className="w-full"
//       >
//         The quick brown fox jumps over the lazy dog.
//       </p>
//     </div>
//   );
// }

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