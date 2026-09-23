import { Palette } from "lucide-react";
import { THEME_COLORS } from "../../constants/writing.constants";

interface FontColorSectionProps {
  onApply: (color: string) => void;
}

export default function FontColorSection({
  onApply,
}: FontColorSectionProps) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Font Color
      </h3>

      <div className="flex flex-wrap items-center gap-2">
        {THEME_COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onApply(color.value)}
            title={color.name}
            aria-label={`Apply ${color.name} font color`}
            className="h-7 w-7 rounded border border-gray-200 transition hover:scale-105 hover:border-gray-400"
            style={{
              backgroundColor: color.value,
            }}
          />
        ))}

        <label
          title="Custom font color"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:bg-gray-100"
        >
          <Palette size={15} />

          <input
            type="color"
            className="sr-only"
            onChange={(event) => onApply(event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}