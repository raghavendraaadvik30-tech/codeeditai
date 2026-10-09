interface Props {
  value: number;

  onChange: (
    value: number,
  ) => void;

  min?: number;

  max?: number;

  step?: number;
}

export function NumericInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: Props) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) =>
        onChange(
          Number(event.target.value),
        )
      }
      className="
        h-9
        w-28
        rounded-md
        border
        border-border
        bg-background
        px-3
        text-sm
        outline-none
        focus:border-primary
        focus:ring-2
        focus:ring-primary/10
      "
    />
  );
}
