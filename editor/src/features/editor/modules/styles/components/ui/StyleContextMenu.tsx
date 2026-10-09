
interface Props {
  hasOverrides: boolean;

  onMatch: () => void;

  onModify: () => void;

  onSelect: () => void;

  onClear: () => void;

  onRevert: () => void;

  onRemove: () => void;
}

export function StyleContextMenu({
  hasOverrides,
  onMatch,
  onModify,
  onSelect,
  onClear,
  onRevert,
  onRemove,
}: Props) {
  return (
    <div
      className="
        absolute
        right-0
        top-full
        z-50
        mt-1
        w-75
        rounded-lg
        border
        border-border
        bg-popover
        text-popover-foreground
        dark:bg-[#111D29]
        dark:border-muted
        dark:text-foreground
        p-1
        shadow-lg
      "
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onMatch}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          text-foreground
          dark:text-foreground
          hover:bg-muted
          dark:hover:bg-muted/60
        "
      >
        Update Style to Match Selection
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onModify}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          text-foreground
          dark:text-foreground
          hover:bg-muted
          dark:hover:bg-muted/60
        "
      >
        Modify...
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSelect}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          text-foreground
          dark:text-foreground
          hover:bg-muted
          dark:hover:bg-muted/60
        "
      >
        Select All Instances
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClear}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          text-foreground
          dark:text-foreground
          hover:bg-muted
          dark:hover:bg-muted/60
        "
      >
        Clear Formatting
      </button>

      {hasOverrides && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRevert}
          className="
            block
            w-full
            rounded
            px-3
            py-2
            text-left
            text-sm
            text-foreground
            dark:text-foreground
            hover:bg-muted
            dark:hover:bg-muted/60
          "
        >
          Revert to Original
        </button>
      )}

      <div className="my-1 border-t border-border dark:border-muted" />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRemove}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          text-destructive
          hover:bg-destructive/10
        "
      >
        Remove from Style Gallery
      </button>
    </div>
  );
}
