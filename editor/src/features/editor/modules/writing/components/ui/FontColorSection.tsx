import { Palette, Check } from "lucide-react";
import { useState } from "react";

import { THEME_COLORS } from "../../constants/writing.constants";

interface FontColorSectionProps {
  onApply: (color: string) => void;
}

export default function FontColorSection({
  onApply,
}: FontColorSectionProps) {
  const [activeColor, setActiveColor] =
    useState<string | null>(null);

  const handleApply = (color: string) => {
    setActiveColor(color);
    onApply(color);
  };

  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Font Color
      </h3>

      <div className="flex flex-wrap items-center gap-2">
        {THEME_COLORS.map((color) => {
          const isActive =
            activeColor === color.value;

          return (
            <button
              type="button"
              onMouseDown={(event) => {
                /*
                 * Prevent the color palette button from
                 * stealing the editor selection.
                 */
                event.preventDefault();
              }}
              onClick={() =>
                handleApply(color.value)
              }
              title={color.name}
              aria-label={`Apply ${color.name} font color`}
              aria-pressed={isActive}
              className={`
                relative
                h-7
                w-7
                rounded
                border
                transition-all
                hover:scale-105
                hover:border-muted-foreground
                ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-secondary"
                }
              `}
              style={{
                backgroundColor: color.value,
              }}
            >
              {isActive && (
                <span
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Check
                    size={14}
                    strokeWidth={3}
                    className="
                      text-primary-foreground
                      drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]
                    "
                  />
                </span>
              )}
            </button>
          );
        })}

        {/* CUSTOM COLOR */}
     <label
  title="Custom font color"
  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-secondary text-muted-foreground transition hover:bg-muted"
  onMouseDown={(event) => {
    event.preventDefault();
  }}
>
  <Palette size={15} />

  <input
    type="color"
    className="sr-only"
    onChange={(event) =>
      onApply(event.target.value)
    }
  />
</label>
      </div>
    </section>
  );
}
