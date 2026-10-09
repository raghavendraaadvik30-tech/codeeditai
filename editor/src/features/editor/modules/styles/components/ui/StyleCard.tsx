
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
          min-h-12
          w-full
          items-center
          rounded-lg
          border
          border-border
          bg-card
          dark:bg-card
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
            className="truncate text-foreground dark:text-foreground"
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
              min-w-17.5
              flex-col
              items-end
              justify-center
              px-2
              text-10px
              leading-tight
              text-muted-foreground
              dark:text-muted-foreground
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
              dark:text-muted-foreground
              dark:hover:text-foreground
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
