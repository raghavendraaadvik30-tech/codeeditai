import { HIGHLIGHT_COLORS } from "../../constants/writing.constants";

interface HighlightSectionProps {
  onApply: (color: string) => void;
  onClear: () => void;
}

export default function HighlightSection({
  onApply,
  onClear,
}: HighlightSectionProps) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Text Highlight
      </h3>

      <div className="flex flex-wrap items-center gap-2">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onApply(color.value)}
            title={color.name}
            aria-label={`Apply ${color.name} highlight`}
            className="h-7 w-7 rounded border border-secondary transition hover:scale-105 hover:border-muted-foreground"
            style={{
              backgroundColor: color.value,
            }}
          />
        ))}

        <button
          type="button"
          onClick={onClear}
          title="Remove highlight"
          className="rounded-md border border-secondary px-2 py-1 text-xs text-secondary-foreground transition hover:bg-muted"
        >
          Remove
        </button>
      </div>
    </section>
  );
}