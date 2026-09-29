// import {
//   ChevronDown,
// } from "lucide-react";

// import {
//   cn,
// } from "@/lib/utils";

// import type {
//   StyleToken,
// } from "../../types/styles.types";

// import {
//   previewFontSize,
// } from "../../utils/styleUtil";

// import {
//   StyleContextMenu,
// } from "./StyleContextMenu";

// interface Props {
//   token: StyleToken;
//   open: boolean;
//   hasOverrides: boolean;

//   onApply: () => void;
//   onToggle: () => void;

//   onMatch: () => void;
//   onModify: () => void;
//   onSelect: () => void;
//   onClear: () => void;
//   onRevert: () => void;
//   onRemove: () => void;
// }

// export function StyleCard({
//   token,
//   open,
//   hasOverrides,
//   onApply,
//   onToggle,
//   onMatch,
//   onModify,
//   onSelect,
//   onClear,
//   onRevert,
//   onRemove,
// }: Props) {
//   const previewPx =
//     previewFontSize(token.size);

//   return (
//     <div className="relative">

//       <div
//         className={cn(
//           "flex items-stretch rounded-md border bg-surface transition-colors",

//           open
//             ? "border-primary/50 bg-primary-soft/20"
//             : "border-border hover:bg-surface-muted",
//         )}
//       >

//         {/* Style preview */}
//         <button
//           onClick={onApply}
//           title={`Apply "${token.name}"`}
//           className="
//             flex-1
//             min-w-0
//             text-left
//             px-2.5
//             py-[7px]
//             rounded-l-md
//             focus-visible:outline-none
//             focus-visible:ring-1
//             focus-visible:ring-ring
//           "
//         >
//           <span
//             style={{
//               fontSize:
//                 `${previewPx}px`,
//               fontWeight:
//                 token.weight,
//               fontFamily:
//                 `${token.font},Calibri,sans-serif`,
//               fontStyle:
//                 token.italic
//                   ? "italic"
//                   : "normal",
//             }}
//             className="
//               block
//               truncate
//               leading-snug
//               select-none
//               text-primary
//             "
//           >
//             {token.name}
//           </span>
//         </button>

//         {/* Font information */}
//         <div className="flex items-center shrink-0 border-l border-border/50">

//           <div className="px-1.5 text-right leading-none">
//             <div className="text-[8px] text-muted-foreground/60 truncate max-w-[50px]">
//               {token.font}
//             </div>

//             <div className="text-[8px] text-muted-foreground/60">
//               {token.size}pt
//             </div>
//           </div>

//           {/* Dropdown */}
//           <button
//             onClick={(event) => {
//               event.stopPropagation();
//               onToggle();
//             }}
//             aria-label={`Options for ${token.name}`}
//             aria-expanded={open}
//             aria-haspopup="menu"
//             className={cn(
//               "h-full px-2 rounded-r-md border-l border-border/50",
//               "text-muted-foreground hover:text-foreground hover:bg-accent",
//               open &&
//                 "bg-primary/10 text-primary",
//             )}
//           >
//             <ChevronDown
//               className={cn(
//                 "size-3 transition-transform duration-150",
//                 open &&
//                   "rotate-180",
//               )}
//             />
//           </button>
//         </div>
//       </div>

//       {open && (
//         <StyleContextMenu
//           name={token.name}
//           instancesCount={0}
//           hasOverrides={hasOverrides}
//           onMatch={onMatch}
//           onModify={onModify}
//           onSelect={onSelect}
//           onClear={onClear}
//           onRevert={onRevert}
//           onRemove={onRemove}
//         />
//       )}
//     </div>
//   );
// }


import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type {
  StyleToken,
} from "../../types/styles.types";

import {
  StyleContextMenu,
} from "./StyleContextMenu";

interface Props {
  token: StyleToken;

  open: boolean;

  hasOverrides: boolean;

  onApply: () => void;

  onToggle: () => void;

  onMatch: () => void;

  onModify: () => void;

  onSelect: () => void;

  onClear: () => void;

  onRevert: () => void;

  onRemove: () => void;
}

export function StyleCard({
  token,
  open,
  hasOverrides,
  onApply,
  onToggle,
  onMatch,
  onModify,
  onSelect,
  onClear,
  onRevert,
  onRemove,
}: Props) {
  return (
    <div className="relative">
      <div
        className={`
          flex
          min-h-[48px]
          w-full
          items-center
          rounded-lg
          border
          border-border
          bg-background
          transition
          hover:border-primary/40
          ${open ? "border-primary" : ""}
        `}
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onApply}
          className="flex-1 min-w-0 px-3 py-2 text-left"
        >
          <div
            style={{
              fontFamily: token.family,
              fontSize: `${Math.min(
                token.size,
                20,
              )}px`,
              fontWeight: token.weight,
              fontStyle: token.italic
                ? "italic"
                : "normal",
              textDecoration:
                token.underline
                  ? "underline"
                  : "none",
            }}
            className="truncate"
          >
            {token.name}
          </div>
        </button>

        <div
          className="
            flex
            h-full
            items-center
            border-l
            border-border
          "
        >
          <div
            className="
              flex
              min-w-[70px]
              flex-col
              items-end
              justify-center
              px-2
              text-[10px]
              leading-tight
              text-muted-foreground
            "
          >
            <span>
              {token.family}
            </span>

            <span>
              {token.size}pt
            </span>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="
              flex
              h-10
              w-8
              items-center
              justify-center
              text-muted-foreground
              hover:text-foreground
            "
          >
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <StyleContextMenu
          hasOverrides={hasOverrides}
          onMatch={onMatch}
          onModify={onModify}
          onSelect={onSelect}
          onClear={onClear}
          onRevert={onRevert}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}