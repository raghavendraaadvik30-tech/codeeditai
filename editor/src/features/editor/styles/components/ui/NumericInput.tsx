import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  decimal?: boolean;
}

export function NumericInput({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  decimal = false,
}: Props) {
  const clamp = (value: number) =>
    Math.max(
      min,
      Math.min(max, value),
    );

  return (
    <div className="flex items-stretch rounded-md border border-border overflow-hidden h-7 w-[90px]">
      <input
        type="number"
        value={
          decimal
            ? parseFloat(
                value.toFixed(2),
              )
            : Math.round(value)
        }
        onChange={(e) => {
          const number = decimal
            ? parseFloat(e.target.value)
            : parseInt(
                e.target.value,
                10,
              );

          if (!Number.isNaN(number)) {
            onChange(clamp(number));
          }
        }}
        min={min}
        max={max}
        step={step}
        className="
          flex-1
          h-full
          text-xs
          text-center
          bg-surface
          px-1
          border-none
          outline-none
        "
      />

      <div className="flex flex-col border-l border-border">
        <button
          type="button"
          onClick={() =>
            onChange(
              clamp(
                parseFloat(
                  (
                    value + step
                  ).toFixed(4),
                ),
              ),
            )
          }
          className="
            flex-1
            px-1
            flex
            items-center
            justify-center
            hover:bg-accent
            text-muted-foreground
            border-b
            border-border/60
          "
        >
          <ChevronUp className="size-2.5" />
        </button>

        <button
          type="button"
          onClick={() =>
            onChange(
              clamp(
                parseFloat(
                  (
                    value - step
                  ).toFixed(4),
                ),
              ),
            )
          }
          className="
            flex-1
            px-1
            flex
            items-center
            justify-center
            hover:bg-accent
            text-muted-foreground
          "
        >
          <ChevronDown className="size-2.5" />
        </button>
      </div>
    </div>
  );
}