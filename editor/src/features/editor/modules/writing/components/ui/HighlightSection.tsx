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
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
            className="h-7 w-7 rounded border border-gray-200 transition hover:scale-105 hover:border-gray-400"
            style={{
              backgroundColor: color.value,
            }}
          />
        ))}

        <button
          type="button"
          onClick={onClear}
          title="Remove highlight"
          className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-100"
        >
          Remove
        </button>
      </div>
    </section>
  );
}