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
        w-[300px]
        rounded-lg
        border
        border-border
        bg-background
        p-1
        shadow-lg
      "
    >
      <button
        onClick={onMatch}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          hover:bg-muted
        "
      >
        Update Style to Match Selection
      </button>

      <button
        onClick={onModify}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          hover:bg-muted
        "
      >
        Modify...
      </button>

      <button
        onClick={onSelect}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          hover:bg-muted
        "
      >
        Select All Instances
      </button>

      <button
        onClick={onClear}
        className="
          block
          w-full
          rounded
          px-3
          py-2
          text-left
          text-sm
          hover:bg-muted
        "
      >
        Clear Formatting
      </button>

      {hasOverrides && (
        <button
          onClick={onRevert}
          className="
            block
            w-full
            rounded
            px-3
            py-2
            text-left
            text-sm
            hover:bg-muted
          "
        >
          Revert to Original
        </button>
      )}

      <div className="my-1 border-t" />

      <button
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